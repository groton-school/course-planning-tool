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

  private student: Student;
  private advisor: Advisor;
  private spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
  private file: GoogleAppsScript.Drive.File;
  private workingCopy?: GoogleAppsScript.Spreadsheet.Sheet;
  private enrollmentTopLeft?: GoogleAppsScript.Spreadsheet.Range;
  private validationSheet?: GoogleAppsScript.Spreadsheet.Sheet;

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
    if (!CoursePlan.coursePlanInventory) {
      CoursePlan.coursePlanInventory = new Inventory(
        Constants.Spreadsheet.Sheet.COURSE_PLAN_INVENTORY
      );
    }
    return CoursePlan.coursePlanInventory.getCoursePlan(student);
  }

  public static createMockup(student?: Student | string) {
    student && State.setStudent(student);
    student = State.getStudent();
    const plan = CoursePlan.for(student);
    const advisorFolder = CoursePlan.getAdvisorFolderFor(student);
    const formFolder = CoursePlan.getFormFolderFor(student);
    CacheService.getUserCache().put(
      CoursePlan.MOCKUP_RESULT,
      JSON.stringify({
        student: student.getFormattedName(),
        plan: {
          name: plan.getName(),
          url: plan.getUrl(),
        },
        formFolder: {
          name: formFolder.getName(),
          url: formFolder.getUrl(),
        },
        advisorFolder: {
          name: advisorFolder.getName(),
          url: advisorFolder.getUrl(),
        },
      }),
      15
    );
    SpreadsheetApp.getUi().showModalDialog(
      HtmlService.createTemplateFromFile('templates/Mockup')
        .evaluate()
        .setHeight(150),
      'Mockup'
    );
  }

  public static getMockupResult() {
    const result = CacheService.getUserCache().get(CoursePlan.MOCKUP_RESULT);
    CacheService.getUserCache().remove(CoursePlan.MOCKUP_RESULT);
    return result;
  }

  private getStudent() {
    return this.student;
  }

  private setStudent(student: Student) {
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
    this.enrollmentTopLeft = null;
  }

  private getEnrollmentOffset(...offset: number[]) {
    if (!this.enrollmentTopLeft && this.workingCopy) {
      this.enrollmentTopLeft = this.getWorkingCopy().getRange(
        Constants.Spreadsheet.A1Notation.ENROLLMENT_TOP_LEFT
      );
    }
    const [rowOffset, columnOffset, numRows, numColumns] = offset;
    switch (offset.length) {
      case 2:
        return this.enrollmentTopLeft.offset(rowOffset, columnOffset);
      case 4:
        return this.enrollmentTopLeft.offset(
          rowOffset,
          columnOffset,
          numRows,
          numColumns
        );
      case 0:
      default:
        return this.enrollmentTopLeft;
    }
  }

  private getValidationSheet() {
    if (!this.validationSheet) {
      this.validationSheet = this.getSpreadsheet().getSheetByName(
        Constants.Spreadsheet.Sheet.COURSES
      );
    }
    return this.validationSheet;
  }

  private getNumDepartments() {
    return this.getValidationSheet().getMaxColumns();
  }

  private populateEnrollmentHistory() {
    const values = [];
    const validations = [];

    for (var row = 0; row < this.getNumDepartments(); row++) {
      const rowValue = [];
      const rowValidation = [];
      for (var column = 0; column < 6; column++) {
        const year = this.getEnrollmentOffset(-1, column).getValue();
        if (
          (year.substr ? Number(year.substr(0, 4)) : year) <
          CoursePlan.getCurrentSchoolYear()
        ) {
          if (
            this.getEnrollmentOffset(-2, column).getValue() == Constants.GRACE
          ) {
            if (row == this.getNumDepartments() - 1) {
              rowValue.push(this.getGRACEEnrollmentsFunction());
            } else {
              rowValue.push('');
            }
          } else {
            const department = this.getEnrollmentOffset()
              .offset(row, -1)
              .getValue();
            rowValue.push(this.getEnrollmentsFunctionBy(year, department));
          }
        } else {
          rowValidation.push(
            SpreadsheetApp.newDataValidation()
              .requireValueInRange(
                this.getValidationSheet()
                  .getRange(Constants.Spreadsheet.A1Notation.DEPT_COURSE_LIST)
                  .offset(0, row)
              )
              .build()
          );
        }
      }
      values.push(rowValue);
      validations.push(rowValidation);
    }

    this.getEnrollmentOffset(0, 0, values.length, values[0].length).setValues(
      values
    );

    this.replaceFunctionsWithDisplayValues();

    this.moveToStudentCoursePlanSpreadsheet();

    if (validations[0].length) {
      this.getEnrollmentOffset(
        0,
        values[0].length,
        validations.length,
        validations[0].length
      ).setDataValidations(validations);
    }

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
        Constants.Spreadsheet.Sheet.FORM_FOLDER_INVENTORY,
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
        Constants.Spreadsheet.Sheet.ADVISOR_FOLDER_INVENTORY,
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
        .getSheetByName(Constants.Spreadsheet.Sheet.COURSE_PLAN)
        .copyTo(State.getDataSheet())
    );
  }

  private populateHeaders() {
    this.setValue(Constants.Spreadsheet.A1Notation.NAMES, [
      [this.getStudent().getFormattedName()],
      [`Advisor: ${this.getAdvisor().getFormattedName()}`],
    ]);
    const gradYear = this.getStudent().gradYear;
    const years: (string | number)[] = [4, 3, 2, 1, 0].map(
      (value) => `${gradYear - value - 1} - ${gradYear - value}`
    );
    years.splice(2, 0, gradYear - 3);
    this.setValue(Constants.Spreadsheet.A1Notation.YEARS, years);
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
      this.getSpreadsheet().getSheetByName(
        Constants.Spreadsheet.Sheet.COURSE_PLAN
      )
    );
    const plan = this.getWorkingCopy().copyTo(this.getSpreadsheet());
    State.getDataSheet().deleteSheet(this.getWorkingCopy());
    this.setWorkingCopy(plan);
    this.getWorkingCopy().setName(Constants.Spreadsheet.Sheet.COURSE_PLAN);
    this.spreadsheet.setActiveSheet(this.getWorkingCopy());
    this.spreadsheet.moveActiveSheet(1);
  }

  private setPermissions() {
    // TODO do we want to protect the course planning grid at all?
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
              Constants.Spreadsheet.Range.TITLE,
              s.eq(
                Constants.Spreadsheet.Range.HOST_ID,
                this.getStudent().hostId
              ),
              s.eq(Constants.Spreadsheet.Range.DEPT, Constants.GRACE)
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
                  `{${Constants.Spreadsheet.Range.TITLE}, ${Constants.Spreadsheet.Range.ORDER}}`,
                  s.eq(
                    Constants.Spreadsheet.Range.HOST_ID,
                    this.getStudent().hostId
                  ),
                  s.eq(Constants.Spreadsheet.Range.YEAR, year),
                  s.eq(Constants.Spreadsheet.Range.DEPT, department)
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
        this.getEnrollmentOffset().getRow() + row,
        numOptions - 1
      );
      this.getEnrollmentOffset(
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

  private prepareCommentBlanks() {
    const numComments = SheetParameters.getNumComments();
    for (const commentor of Constants.COMMENTORS) {
      const row = this.getWorkingCopy()
        .getRange(1, 2, this.getWorkingCopy().getMaxRows(), 1)
        .getValues()
        .findIndex(([cell]) => cell == commentor);
      const protection = this.getWorkingCopy()
        .getRange(row + 3, 2, 2, commentor == Constants.COMMENTORS[0] ? 4 : 5)
        .protect()
        .setDescription(commentor);
      const me = Session.getEffectiveUser();
      protection.addEditor(me);
      protection.removeEditors(protection.getEditors());
      if (protection.canDomainEdit()) {
        protection.setDomainEdit(false);
      }
      switch (commentor) {
        case Constants.COMMENTORS[0]:
          protection.addEditor(this.getAdvisor().email);
          break;
        case Constants.COMMENTORS[1]:
          protection.addEditor(SheetParameters.getStudiesCommittee());
          break;
        case Constants.COMMENTORS[2]:
          protection.addEditor(SheetParameters.getCollegeCounseling());
          break;
      }
      this.additionalComments(row + 3, numComments);
    }
  }
}

global.action_coursePlan_mockup = CoursePlan.createMockup;
export const Mockup = 'action_coursePlan_mockup';

global.helper_coursePlan_getMockupResult = CoursePlan.getMockupResult;
