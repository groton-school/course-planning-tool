import g from '@battis/gas-lighter';
import * as Inventory from '../Inventory';
import * as Role from '../Role';
import * as SheetParameters from './SheetParameters';

export default class CoursePlan {
  // these can be calculated by searching for #X where X is getXStepCount
  public static getCreateStepCount = () => 13;
  public static getUpdateStepCount = () => 5;
  public static getDeleteStepCount = () => 4;

  private static formFolderInventoryForPlans = new Inventory.Folder(
    'Plans Form Folder Inventory',
    (gradYear) =>
      CoursePlan.applyFormat(SheetParameters.getFormFolderNameFormat(), {
        gradYear
      })
  );
  private static formFolderInventoryForFolders = new Inventory.Folder(
    'Folders Form Folder Inventory',
    (gradYear) =>
      CoursePlan.applyFormat(SheetParameters.getFormFolderNameFormat(), {
        gradYear
      })
  );
  private static studentFolderInventory = new Inventory.StudentFolder(
    'Student Folder Inventory',
    (hostId) =>
      CoursePlan.applyFormat(
        SheetParameters.getStudentFolderNameFormat(),
        Role.Student.getByHostId(hostId.toString())
      )
  );
  private static advisorFolderInventory = new Inventory.Folder(
    'Advisor Folder Inventory',
    (email) =>
      CoursePlan.applyFormat(
        SheetParameters.getAdvisorFolderNameFormat(),
        Role.Advisor.getByEmail(email.toString())
      )
  );
  private static coursePlanInventory = new Inventory.CoursePlan(
    'Course Plan Inventory'
  );

  private static coursesByDepartment: any[][];
  private static currentSchoolyear?: number = null;

  private student: Role.Student;
  private advisor: Role.Advisor;
  private spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
  private file: GoogleAppsScript.Drive.File;
  private workingCopy?: GoogleAppsScript.Spreadsheet.Sheet;
  private anchor?: GoogleAppsScript.Spreadsheet.Range;
  private planSheet?: GoogleAppsScript.Spreadsheet.Sheet;
  private validationSheet?: GoogleAppsScript.Spreadsheet.Sheet;
  private numOptionsPerDepartment?: number = null;
  private numComments?: number = null;

  public static bindTo = (
    spreadsheetId: string,
    hostId: Inventory.Key
  ): CoursePlan => new CoursePlan({ hostId, spreadsheetId });

  public static for(student: Role.Student) {
    g.HtmlService.Element.Progress.setStatus(
      CoursePlan.thread,
      `${student.getFormattedName()} (consulting inventory)`
    );
    return CoursePlan.coursePlanInventory.get(student.hostId);
  }

  public static getAll = () => CoursePlan.coursePlanInventory.getAll();

  private static thread = 'course-plan';

  public static setThread(thread: string) {
    CoursePlan.thread = thread;
  }

  private setStatus(message: string) {
    g.HtmlService.Element.Progress.setStatus(
      CoursePlan.thread,
      `${this.getStudent().getFormattedName()} (${message})`
    );
    g.HtmlService.Element.Progress.incrementValue(CoursePlan.thread);
  }

  public constructor(arg: Role.Student | { hostId; spreadsheetId }) {
    if (arg instanceof Role.Student) {
      this.createFromStudent(arg);
    } else {
      this.bindToExistingSpreadsheet(arg);
    }
  }

  private createFromStudent(student: Role.Student) {
    this.setStudent(student);
    this.createFromTemplate();
    this.populateEnrollmentHistory();
    this.populateHeaders();
    this.createStudentFolder();
    this.setPermissions();
    this.prepareCommentBlanks();
    this.setStatus('updating inventory'); // #create
    CoursePlan.coursePlanInventory.add([
      this.getHostId(),
      this.getSpreadsheet().getId(),
      this.getSpreadsheet().getUrl()
    ]);
    CoursePlan.coursePlanInventory.setMetadata(this.getHostId(), Inventory.CoursePlan.COL_NUM_OPTIONS_PER_DEPT, this.getNumOptionsPerDepartment());
    CoursePlan.coursePlanInventory.setMetadata(this.getHostId(), Inventory.CoursePlan.COL_NUM_COMMENTS, this.getNumComments());
    this.setStatus('finished'); // #create
  }

  private bindToExistingSpreadsheet({ hostId, spreadsheetId }) {
    // TODO add option to update when "created"?
    this.setStudent(Role.Student.getByHostId(hostId));
    this.setSpreadsheet(SpreadsheetApp.openById(spreadsheetId));
  }

  public getStudent = () => this.student;

  public getHostId = () => this.getStudent().hostId;

  private setStudent(student: Role.Student) {
    this.student = student;
    this.setStatus('identifying student'); // #create, #update, #delete
  }

  public getAdvisor() {
    if (!this.advisor && this.student) {
      this.advisor = this.getStudent().getAdvisor();
    }
    return this.advisor;
  }

  public setAdvisor = (advisor: Role.Advisor) => (this.advisor = advisor);

  public getSpreadsheet = () => this.spreadsheet;

  private setSpreadsheet = (
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
  ) => (this.spreadsheet = spreadsheet);

  public getFile() {
    if (!this.file && this.spreadsheet) {
      this.file = DriveApp.getFileById(this.getSpreadsheet().getId());
    }
    return this.file;
  }

  private getWorkingCopy = () => this.workingCopy;

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

  public getPlanSheet() {
    if (!this.planSheet) {
      this.planSheet = this.getSpreadsheet().getSheetByName('Course Plan');
    }
    return this.planSheet;
  }

  public getValidationSheet() {
    if (!this.validationSheet) {
      this.validationSheet = this.getSpreadsheet().getSheetByName(
        'Courses by Department'
      );
    }
    return this.validationSheet;
  }

  private getIndividualEnrollmentHistory = () => SpreadsheetApp.getActive().getSheetByName('Individual Enrollment History');

  private getNumDepartments = () => this.getValidationSheet().getMaxColumns();

  private getNumOptionsPerDepartment(): number {
    if (this.numOptionsPerDepartment === null) {
      if (CoursePlan.coursePlanInventory.has(this.getHostId())) {
        this.numOptionsPerDepartment = CoursePlan.coursePlanInventory.getMetadata(this.getHostId(), Inventory.CoursePlan.COL_NUM_OPTIONS_PER_DEPT);
      } else {
        this.numOptionsPerDepartment = SheetParameters.getNumOptionsPerDepartment();
      }
    }
    return this.numOptionsPerDepartment;
  }

  private getNumComments(): number {
    if (this.numComments === null) {
      if (CoursePlan.coursePlanInventory.has(this.getHostId())) {
        this.numComments = CoursePlan.coursePlanInventory.getMetadata(this.getHostId(), Inventory.CoursePlan.COL_NUM_COMMENTS);
      } else {
        this.numComments = SheetParameters.getNumComments();
      }
    }
    return this.numComments;
  }

  public updateEnrollmentHistory() {
    this.populateEnrollmentHistory(false);
  }

  private populateEnrollmentHistory(create = true) {
    this.setWorkingCopy(this.getPlanSheet());

    this.setStatus('calculating enrollment history'); // #create, #update
    const ieh = this.getIndividualEnrollmentHistory();
    ieh.getRange('IEH_HostID_Selector').setValue(this.getHostId());
    const values = ieh.getRange('IEH_EnrollmentHistory').offset(0, 0, ieh.getRange('IEH_Departments').getNumRows(), 5 - (this.getStudent().gradYear - CoursePlan.getCurrentSchoolYear())).getDisplayValues();
    this.setWorkingCopy(this.getPlanSheet());

    const validations = [];
    const start = ieh.getRange('IEH_NumericalYears').getDisplayValues()[0].findIndex(y => parseInt(y) > CoursePlan.getCurrentSchoolYear());
    if (create) {
      for (var row = 0; row < this.getNumDepartments(); row++) {
        const rowValidation = [];
        for (var year = start; year < 5; year++) {
          rowValidation.push(
            SpreadsheetApp.newDataValidation()
              .requireValueInRange(
                this.getValidationSheet().getRange('A2:A').offset(0, row)
              )
              .build()
          );
        }
        validations.push(rowValidation);
      }
    }

    if (create) {
      // TODO need to incrementally expand protection when history expands
      this.protectNonCommentRanges(values[0].length, values.length);

      this.setStatus('configuring data validation'); // #create
      this.getAnchorOffset(0, values[0].length, validations.length, validations[0].length).setDataValidations(validations);

      this.insertAndMergeOptionsRows(values[0].length);
    }

    this.setStatus('publishing enrollment history') // #create, #update
    for (let row = 0; row < values.length; row++) {
      const target = this.getAnchorOffset(row * this.getNumOptionsPerDepartment(), 0, 1, values[row].length);
      target.clearDataValidations();
      target.setValues([values[row]]);
    }

    this.updateCourseList();
  }

  private static applyFormat = (format, data) =>
    Object.keys(data).reduce(
      (format, key) => format.replaceAll(`{{${key}}}`, data[key]),
      format
    );

  private getFormFolderForPlan = () =>
    CoursePlan.formFolderInventoryForPlans.get(this.getStudent().gradYear);

  public static getFormFolderForStudentFolderFor = (student: Role.Student) =>
    CoursePlan.formFolderInventoryForFolders.get(student.gradYear);

  public getStudentFolder = () =>
    CoursePlan.studentFolderInventory.get(this.getHostId());

  private getAdvisorFolder = () =>
    CoursePlan.advisorFolderInventory.get(this.getAdvisor().email);

  public static getAdvisorFolderFor = (student: Role.Student) =>
    CoursePlan.advisorFolderInventory.get(student.getAdvisor().email);

  private createFromTemplate() {
    this.setStatus('creating course plan from template'); // #create
    const template = SpreadsheetApp.openByUrl(
      SheetParameters.getCoursePlanTemplate()
    );
    this.setSpreadsheet(
      template.copy(
        CoursePlan.applyFormat(
          SheetParameters.getCoursePlanNameFormat(),
          this.getStudent()
        )
      )
    );
  }

  private populateHeaders() {
    this.setStatus('filling in the labels'); // #create
    g.SpreadsheetApp.Value.set(this.getWorkingCopy(), 'Template_Names', [
      [this.getStudent().getFormattedName()],
      [`Advisor: ${this.getAdvisor().getFormattedName()}`]
    ]);
    g.SpreadsheetApp.Value.set(this.getWorkingCopy(), 'Template_Years', this.getIndividualEnrollmentHistory().getRange('IEH_Years').getDisplayValues());
  }

  private createStudentFolder() {
    this.setStatus('creating student folder'); // #create
    const creating = !CoursePlan.studentFolderInventory.has(
      this.getHostId()
    );
    const studentFolder = this.getStudentFolder();
    studentFolder.createShortcut(this.getFile().getId());
    if (creating) {
      this.getAdvisorFolder().createShortcut(this.getStudentFolder().getId());
    }
    g.DriveApp.Permission.add(
      studentFolder.getId(),
      this.getStudent().email,
      g.DriveApp.Permission.Role.Reader
    );
    g.DriveApp.Permission.add(
      studentFolder.getId(),
      this.getAdvisor().email,
      g.DriveApp.Permission.Role.Reader
    );
  }

  public createStudentFolderIfMissing() {
    if (!CoursePlan.studentFolderInventory.has(this.getHostId())) {
      this.createStudentFolder();

      this.setStatus(
        'replacing plan shortcut with folder shortcut in advisor folder'
      );
      const shortcuts = this.getAdvisorFolder().getFilesByName(
        CoursePlan.applyFormat(
          SheetParameters.getCoursePlanNameFormat(),
          this.getStudent()
        )
      );
      while (shortcuts.hasNext()) {
        shortcuts.next().setTrashed(true);
      }
      this.getAdvisorFolder().createShortcut(this.getStudentFolder().getId());
    }
  }

  private setPermissions() {
    const COL_ADVISOR_FOLDER_PERMISSION = 6;
    this.setStatus('setting permissions'); // #create
    this.getFile().moveTo(this.getFormFolderForPlan());
    g.DriveApp.Permission.add(this.getFile().getId(), this.getStudent().email);
    g.DriveApp.Permission.add(this.getFile().getId(), this.getAdvisor().email);

    if (
      !CoursePlan.advisorFolderInventory.getMetadata(
        this.getAdvisor().email,
        COL_ADVISOR_FOLDER_PERMISSION
      )
    ) {
      g.DriveApp.Permission.add(
        this.getAdvisorFolder().getId(),
        this.getAdvisor().email,
        g.DriveApp.Permission.Role.Reader
      );
      CoursePlan.advisorFolderInventory.setMetadata(
        this.getAdvisor().email,
        COL_ADVISOR_FOLDER_PERMISSION,
        true
      );
    }
  }


  public static getCurrentSchoolYear() {
    if (CoursePlan.currentSchoolyear === null) {
      const now = new Date();
      CoursePlan.currentSchoolyear = now.getMonth() > 6 ? now.getFullYear() + 1 : now.getFullYear();
    }
    return CoursePlan.currentSchoolyear;
  }

  // TODO adjust row height to accommodate actual content lines
  private insertAndMergeOptionsRows(valueWidth: number) {
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

  private additionalComments(row: number) {
    this.getWorkingCopy().insertRowsAfter(row, this.getNumComments() - 2);
    for (var i = 0; i < this.getNumComments() - 2; i++) {
      this.getWorkingCopy()
        .getRange(row + i + 1, 3, 1, 3)
        .mergeAcross();
    }
  }

  private protectNonCommentRanges(historyWidth: number, historyHeight: number) {
    this.setStatus('protecting data'); // #create
    const history = this.getAnchorOffset(0, 0, historyHeight, historyWidth);
    for (const range of [
      history.getA1Notation(),
      'Protect_LeftMargin',
      'Protect_TopMargin',
      'Protect_BetweenComments'
    ]) {
      const protection = this.getWorkingCopy()
        .getRange(range)
        .protect()
        .setDescription('No Edits');
      g.SpreadsheetApp.Protection.clearEditors(protection);
    }
  }

  private prepareCommentBlanks() {
    this.setStatus('making room for comments'); // #create
    const commentors = [
      {
        name: 'Comments from Faculty Advisor',
        range: 'Protect_Advisor',
        editor: this.getAdvisor().email
      },
      {
        name: 'Comments from College Counseling Office',
        range: 'Protect_CollegeCounselingOffice',
        editor: SheetParameters.getCollegeCounseling()
      }
    ];
    for (const { name, range, editor } of commentors) {
      const protection = this.getWorkingCopy()
        .getRange(range)
        .protect()
        .setDescription(name);
      g.SpreadsheetApp.Protection.clearEditors(protection);
      protection.addEditor(editor);
      this.additionalComments(protection.getRange().getRow());
    }
  }

  private static getCoursesByDepartment(): string[][] {
    if (!this.coursesByDepartment) {
      this.coursesByDepartment = g.SpreadsheetApp.Value.getSheetDisplayValues(
        this.coursePlanInventory
          .getSpreadsheet()
          .getSheetByName('Courses by Department')
      );
    }
    return this.coursesByDepartment;
  }

  public updateCourseList() {
    this.setStatus('updating course list'); // #create, #update
    const source = CoursePlan.getCoursesByDepartment();
    const destination = this.spreadsheet.getSheetByName(
      'Courses by Department'
    );
    const destHeight = destination.getMaxRows();
    if (destHeight < source.length) {
      destination.insertRowsAfter(destHeight, source.length - destHeight);
    } else if (destHeight > source.length) {
      destination.deleteRows(source.length, destHeight - source.length);
    }
    g.SpreadsheetApp.Value.set(
      destination,
      destination
        .getRange(1, 1, source.length, source[0].length)
        .getA1Notation(),
      source
    );
  }

  public delete() {
    const file = this.getFile();
    this.setStatus('removing from inventory'); // #delete
    CoursePlan.coursePlanInventory.remove(this.getHostId());

    this.setStatus('trashing shortcuts to plan'); // #delete
    const shortcuts = this.getStudentFolder().getFilesByType(
      'application/vnd.google-apps.shortcut'
    );
    while (shortcuts.hasNext()) {
      const shortcut = shortcuts.next();
      if (shortcut.getTargetId() == file.getId()) {
        shortcut.setTrashed(true);
      }
    }

    this.setStatus('trashing plan'); // #delete
    file.setTrashed(true);
  }
}

global.coursePlanGetAll = CoursePlan.getAll;
