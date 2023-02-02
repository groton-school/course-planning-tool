import Advisor from './Advisor';
import Constants from './Constants';
import Inventory from './Inventory';
import SheetParameters from './SheetParameters';
import State from './State';
import Student from './Student';
import { Helper } from '@battis/google-apps-script-helpers';

const s = Helper.SpreadsheetApp;

export default class CoursePlan {
  private static readonly MOCKUP_RESULT = `${Constants.PREFIX}.CoursePlan.Mockup`;

  private static formFolderInventory?: Inventory;
  private static advisorFolderInventory?: Inventory;
  private static coursePlanInventory?: Inventory;
  private static me?: GoogleAppsScript.Base.User;

  private student: Student;
  private advisor: Advisor;
  private spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
  private file: GoogleAppsScript.Drive.File;
  private workingCopy?: GoogleAppsScript.Spreadsheet.Sheet;
  private anchor?: GoogleAppsScript.Spreadsheet.Range;
  private validationSheet?: GoogleAppsScript.Spreadsheet.Sheet;

  // FIXME CoursePlan constructor should be private to enforce inventory updates
  public constructor(student: Student) {
    // TODO deal with GRACE course selection
    this.setStudent(student);
    this.createFromTemplate();
    this.populateHeaders();
    this.populateEnrollmentHistory();
    this.setPermissions();
    this.prepareCommentBlanks();
  }

  public static for(student: Student) {
    // TODO update inventory page way sooner
    if (!CoursePlan.coursePlanInventory) {
      CoursePlan.coursePlanInventory = new Inventory('Course Plan Inventory');
    }
    State.setProgress('Updating inventory');
    return CoursePlan.coursePlanInventory.getCoursePlan(student);
  }

  private getStudent() {
    return this.student;
  }

  private setStudent(student: Student) {
    State.setProgress('Identifying student');
    this.student = student;
  }

  private getAdvisor() {
    if (!this.advisor && this.student) {
      this.advisor = this.getStudent().getAdvisor();
    }
    return this.advisor;
  }

  public setAdvisor(advisor: Advisor) {
    this.advisor = advisor;
  }

  public getSpreadsheet() {
    return this.spreadsheet;
  }

  private setSpreadsheet(
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
  ) {
    this.spreadsheet = spreadsheet;
  }

  public getFile() {
    if (!this.file && this.spreadsheet) {
      this.file = DriveApp.getFileById(this.getSpreadsheet().getId());
    }
    return this.file;
  }

  private getWorkingCopy() {
    return this.workingCopy;
  }

  private setWorkingCopy(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.workingCopy = sheet;
    this.anchor = null;
  }

  private getAnchorOffset(...offset: number[]) {
    if (!this.anchor && this.workingCopy) {
      this.anchor = this.getWorkingCopy().getRange('Template_Anchor');
    }
    const [rowOffset, columnOffset, numRows, numColumns] = offset;
    switch (offset.length) {
      case 2:
        return this.anchor.offset(rowOffset, columnOffset);
      case 4:
        return this.anchor.offset(rowOffset, columnOffset, numRows, numColumns);
      case 0:
      default:
        return this.anchor;
    }
  }

  private getValidationSheet() {
    if (!this.validationSheet) {
      this.validationSheet = this.getSpreadsheet().getSheetByName(
        'Courses by Department'
      );
    }
    return this.validationSheet;
  }

  private getNumDepartments() {
    return this.getValidationSheet().getMaxColumns();
  }

  private populateEnrollmentHistory() {
    State.setProgress('Writing course enrollment history');
    const values = [];
    const validations = [];

    for (var row = 0; row < this.getNumDepartments(); row++) {
      const rowValue = [];
      const rowValidation = [];
      for (var column = 0; column < 6; column++) {
        const year = this.getAnchorOffset(-1, column).getValue();
        if (
          (year.substr ? Number(year.substr(0, 4)) : year) <
          CoursePlan.getCurrentSchoolYear()
        ) {
          if (this.getAnchorOffset(-2, column).getValue() == 'GRACE') {
            if (row == this.getNumDepartments() - 1) {
              rowValue.push(this.getGRACEEnrollmentsFunction());
            } else {
              rowValue.push('');
            }
          } else {
            const department = this.getAnchorOffset()
              .offset(row, -1)
              .getValue();
            rowValue.push(this.getEnrollmentsFunctionBy(year, department));
          }
        } else {
          rowValidation.push(
            SpreadsheetApp.newDataValidation()
              .requireValueInRange(
                this.getValidationSheet().getRange('A2:A').offset(0, row)
              )
              .build()
          );
        }
      }
      values.push(rowValue);
      validations.push(rowValidation);
    }

    const historyHeight = values.length;
    const historyWidth = values[0].length;

    this.getAnchorOffset(0, 0, historyHeight, historyWidth).setValues(values);

    this.replaceFunctionsWithDisplayValues();

    State.setProgress('Moving course plan into place');
    this.moveToStudentCoursePlanSpreadsheet();

    if (validations[0].length) {
      this.getAnchorOffset(
        0,
        historyWidth,
        validations.length,
        validations[0].length
      ).setDataValidations(validations);
    }

    State.setProgress('Protecting data');
    this.protectNonCommentRanges(historyWidth, historyHeight);

    this.insertAndMergeOptionsRows(values[0].length);
  }

  private static applyFormat(format, data) {
    return Object.keys(data).reduce(
      (format, key) => format.replaceAll(`{{${key}}}`, data[key]),
      format
    );
  }

  private static getFormFolderInventory() {
    if (!CoursePlan.formFolderInventory) {
      CoursePlan.formFolderInventory = new Inventory(
        'Form Folder Inventory',
        (gradYear) =>
          CoursePlan.applyFormat(SheetParameters.getFormFolderNameFormat(), {
            gradYear,
          })
      );
    }
    return CoursePlan.formFolderInventory;
  }

  private getFormFolder() {
    return CoursePlan.getFormFolderInventory().getFolder(
      this.getStudent().gradYear
    );
  }

  public static getFormFolderFor(student: Student) {
    return CoursePlan.getFormFolderInventory().getFolder(student.gradYear);
  }

  private static getAdvisorFolderInventory() {
    if (!CoursePlan.advisorFolderInventory) {
      CoursePlan.advisorFolderInventory = new Inventory(
        'Advisor Folder Inventory',
        (email) =>
          CoursePlan.applyFormat(
            SheetParameters.getAdvisorFolderNameFormat(),
            Advisor.getByEmail(email.toString())
          )
      );
    }
    return CoursePlan.advisorFolderInventory;
  }

  private getAdvisorFolder() {
    return CoursePlan.getAdvisorFolderInventory().getFolder(
      this.getAdvisor().email
    );
  }

  public static getAdvisorFolderFor(student: Student) {
    return CoursePlan.getAdvisorFolderInventory().getFolder(
      student.getAdvisor().email
    );
  }

  // TODO setValue() should really be dumped into @battis/google-apps-script-helpers
  private setValue(a1notation: string, value) {
    const range = this.getWorkingCopy().getRange(a1notation);

    if (Array.isArray(value)) {
      if (!Array.isArray(value[0])) {
        value = [value];
      }
      range.setValues(value);
    } else {
      range.offset(0, 0, 1, 1).setValue(value);
    }
  }

  private createFromTemplate() {
    State.setProgress('Creating course plan from template');
    const template = State.getTemplate();
    this.setSpreadsheet(
      template.copy(
        CoursePlan.applyFormat(
          SheetParameters.getCoursePlanNameFormat(),
          this.getStudent()
        )
      )
    );
    s.addImportrangePermission(this.getSpreadsheet(), State.getDataSheet());
    this.setWorkingCopy(
      this.getSpreadsheet()
        .getSheetByName(Constants.COURSE_PLAN)
        .copyTo(State.getDataSheet())
    );
  }

  private populateHeaders() {
    State.setProgress('Filling in the labels');
    this.setValue('Template_Names', [
      [this.getStudent().getFormattedName()],
      [`Advisor: ${this.getAdvisor().getFormattedName()}`],
    ]);
    const gradYear = this.getStudent().gradYear;
    const years: (string | number)[] = [4, 3, 2, 1, 0].map(
      (value) => `${gradYear - value - 1} - ${gradYear - value}`
    );
    years.splice(2, 0, gradYear - 3);
    this.setValue('Template_Years', years);
  }

  private replaceFunctionsWithDisplayValues() {
    const range = this.getWorkingCopy().getRange(
      1,
      1,
      this.getWorkingCopy().getMaxRows(),
      this.getWorkingCopy().getMaxColumns()
    );
    const display = range.getDisplayValues();
    range.setValues(display);
  }

  private moveToStudentCoursePlanSpreadsheet() {
    this.getSpreadsheet().deleteSheet(
      this.getSpreadsheet().getSheetByName(Constants.COURSE_PLAN)
    );
    const plan = this.getWorkingCopy().copyTo(this.getSpreadsheet());
    State.getDataSheet().deleteSheet(this.getWorkingCopy());
    this.setWorkingCopy(plan);
    this.getWorkingCopy().setName(Constants.COURSE_PLAN);
    this.spreadsheet.setActiveSheet(this.getWorkingCopy());
    this.spreadsheet.moveActiveSheet(1);
  }

  private setPermissions() {
    State.setProgress('Setting permissions');
    this.getFile().moveTo(this.getFormFolder());
    this.getAdvisorFolder().createShortcut(this.getFile().getId());
    Helper.DriveApp.addPermission(
      this.getFile().getId(),
      this.getStudent().email
    );
    Helper.DriveApp.addPermission(
      this.getFile().getId(),
      this.getAdvisor().email
    );
    Helper.DriveApp.addPermission(
      this.getAdvisorFolder().getId(),
      this.getAdvisor().email,
      Helper.DriveApp.Permission.Role.Reader
    );
  }

  private getGRACEEnrollmentsFunction(): string {
    return (
      '=' +
      s.ifna(
        s.join(
          s.char(10),
          s.sort(
            s.filter(
              'Enrollment_Title',
              s.eq('Enrollment_Host_ID', this.getStudent().hostId),
              s.eq('Enrollment_Department', 'GRACE')
            )
          )
        ),
        ''
      )
    );
  }

  private getEnrollmentsFunctionBy(year: string, department: string): string {
    return (
      '=' +
      s.ifna(
        s.join(
          s.char(10),
          s.unique(
            s.index(
              s.sort(
                s.filter(
                  '{Enrollment_Title, Enrollment_Order}',
                  s.eq('Enrollment_Host_ID', this.getStudent().hostId),
                  s.eq('Enrollment_Year', year),
                  s.eq('Enrollment_Department', department)
                ),
                2,
                true,
                1,
                true
              ),
              '',
              1
            )
          )
        ),
        ''
      )
    );
  }

  public static getCurrentSchoolYear() {
    const now = new Date();
    return now.getMonth() > 6 ? now.getFullYear() + 1 : now.getFullYear();
  }

  private insertAndMergeOptionsRows(valueWidth) {
    const numOptions = SheetParameters.getNumOptionsPerDepartment();
    for (
      var row = 0;
      row < this.getNumDepartments() * numOptions;
      row += numOptions
    ) {
      this.getWorkingCopy().insertRowsAfter(
        this.getAnchorOffset().getRow() + row,
        numOptions - 1
      );
      this.getAnchorOffset(
        row,
        -1,
        numOptions,
        valueWidth + 1
      ).mergeVertically();
    }
  }

  private additionalComments(row: number, targetNumComments: number) {
    this.getWorkingCopy().insertRowsAfter(row, targetNumComments - 2);
    for (var i = 0; i < targetNumComments - 2; i++) {
      this.getWorkingCopy()
        .getRange(row + i + 1, 3, 1, 3)
        .mergeAcross();
    }
  }

  private protectNonCommentRanges(historyWidth: number, historyHeight: number) {
    const history = this.getAnchorOffset(0, 0, historyHeight, historyWidth);
    for (const range of [
      history.getA1Notation(),
      'Protect_LeftMargin',
      'Protect_RightMargin',
      'Protect_TopMargin',
      'Protect_AdvisorInitials',
      'Protect_AfterAdvisor',
      'Protect_AfterStudiesCommittee',
    ]) {
      const protection = this.getWorkingCopy()
        .getRange(range)
        .protect()
        .setDescription('No Edits');
      this.clearEditors(protection);
    }
  }

  private clearEditors(protection: GoogleAppsScript.Spreadsheet.Protection) {
    if (!CoursePlan.me) {
      CoursePlan.me = Session.getEffectiveUser();
    }
    protection.addEditor(CoursePlan.me);
    protection.removeEditors(protection.getEditors());
    if (protection.canDomainEdit()) {
      protection.setDomainEdit(false);
    }
  }

  private prepareCommentBlanks() {
    State.setProgress('Making room for comments');
    const numComments = SheetParameters.getNumComments();
    const commentors = {
      'Comments from Faculty Advisor': this.getAdvisor().email,
      'Comments from Studies Committee': SheetParameters.getStudiesCommittee(),
      'Comments from College Counseling Office':
        SheetParameters.getCollegeCounseling(),
    };
    for (const commentor in commentors) {
      // TODO extract finding a cell by content to @battis/google-apps-script-helpers
      const row = this.getWorkingCopy()
        .getRange(1, 2, this.getWorkingCopy().getMaxRows(), 1)
        .getValues()
        .findIndex(([cell]) => cell == commentor);
      const protection = this.getWorkingCopy()
        .getRange(
          row + 3,
          2,
          2,
          commentor == 'Comments from Faculty Advisor' ? 4 : 5
        )
        .protect()
        .setDescription(commentor);
      this.clearEditors(protection);
      protection.addEditor(commentors[commentor]);
      this.additionalComments(row + 3, numComments);
    }
  }
}
