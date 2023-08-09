import g from '@battis/gas-lighter';
import Inventory from './Inventory';
import lib from './lib';
import Role from './Role';

export default class CoursePlan {
  // these can be calculated by searching for #X where X is getXStepCount
  public static getCreateStepCount = () => 12;
  public static getUpdateEnrollmentHistoryStepCount = () => 4;
  public static getUpdateCourseListStepCount = () => 2;
  public static getDeleteStepCount = () => 4;

  public static thread = 'course-plan';

  private static coursesByDepartment: any[][];
  private static currentSchoolyear?: number = null;

  private _student: Role.Student;
  public get student() {
    return this._student;
  }
  private set student(student: Role.Student) {
    this._student = student;
    this.setStatus('identifying student'); // #create, #update-history, #update-courses, #delete
  }
  public get hostId() {
    return this.student.hostId;
  }

  private _advisor: Role.Advisor;
  public get advisor() {
    if (!this._advisor && this.student) {
      this._advisor = this.student.getAdvisor();
    }
    return this._advisor;
  }
  private set advisor(advisor: Role.Advisor) {
    this._advisor = advisor;
  }

  private _spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
  public get spreadsheet() {
    return this._spreadsheet;
  }
  private set spreadsheet(
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
  ) {
    this._spreadsheet = spreadsheet;
  }

  private _file: GoogleAppsScript.Drive.File;
  public get file() {
    if (!this._file && this.spreadsheet) {
      this._file = DriveApp.getFileById(this.spreadsheet.getId());
    }
    return this._file;
  }

  private _workingCopy?: GoogleAppsScript.Spreadsheet.Sheet;
  private get workingCopy() {
    if (!this._workingCopy) {
      this._workingCopy = this.planSheet;
    }
    return this.workingCopy;
  }
  private set workingCopy(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this._workingCopy = sheet;
    this.anchor = null;
  }

  private anchor?: GoogleAppsScript.Spreadsheet.Range;
  private _planSheet?: GoogleAppsScript.Spreadsheet.Sheet;
  private get planSheet() {
    if (!this._planSheet) {
      this._planSheet = this.spreadsheet.getSheetByName('Course Plan');
    }
    return this._planSheet;
  }

  private _validationSheet?: GoogleAppsScript.Spreadsheet.Sheet;
  private get validationSheet() {
    if (!this._validationSheet) {
      this._validationSheet = this.spreadsheet.getSheetByName(
        'Courses by Department'
      );
    }
    return this._validationSheet;
  }

  private numOptionsPerDepartment?: number = null;
  private numComments?: number = null;

  public static bindTo = (
    spreadsheetId: string,
    hostId: Inventory.Key
  ): CoursePlan => new CoursePlan({ hostId, spreadsheetId });

  public static for(hostId: string): CoursePlan;
  public static for(student: Role.Student): CoursePlan;
  public static for(target: string | Role.Student): CoursePlan {
    if (typeof target === 'string') {
      const plan = Inventory.CoursePlans.get(target);
      if (plan.hasNewAdvisor() && !plan.hasPermissionsUpdate()) {
        Logger.log(
          `Need to update course plan permissions for ${plan.file.getName()}`
        );
        plan.updateAdvisorPermissions();
      }
      if (plan.hasNewAdvisor() && !plan.hasStudentFolderPermissionsUpdate()) {
        Logger.log(
          `Need to update folder permissions for ${Inventory.StudentFolders.for(
            plan
          ).getName()}`
        );
        plan.updateStudentFolderPermissions();
      }
      return plan;
    } else {
      g.HtmlService.Element.Progress.setStatus(
        CoursePlan.thread,
        `${target.getFormattedName()} (consulting inventory)`
      );
      return CoursePlan.for(target.hostId);
    }
  }

  private setStatus(message: string) {
    g.HtmlService.Element.Progress.setStatus(
      CoursePlan.thread,
      `${this.student.getFormattedName()} (${message})`
    );
    g.HtmlService.Element.Progress.incrementValue(CoursePlan.thread);
  }

  public constructor({
    hostId,
    spreadsheetId
  }: {
    hostId: Inventory.Key;
    spreadsheetId: string;
  });
  public constructor(student: Role.Student);
  public constructor(arg: Role.Student | { hostId; spreadsheetId }) {
    if (arg instanceof Role.Student) {
      this.createFromStudent(arg);
    } else {
      this.bindToExistingSpreadsheet(arg);
    }
  }

  private createFromStudent(student: Role.Student) {
    this.student = student;
    this.createFromTemplate();
    this.populateEnrollmentHistory();
    this.populateHeaders();
    this.createStudentFolder();
    this.setPermissions();
    this.prepareCommentBlanks();
    this.updateCourseList();
    this.setStatus('updating inventory'); // #create
    Inventory.CoursePlans.add([
      this.hostId,
      this.spreadsheet.getId(),
      this.spreadsheet.getUrl()
    ]);
    Inventory.CoursePlans.setMetadata(
      this.hostId,
      Inventory.CoursePlans.Cols.NumOptionsPerDepartment,
      this.getNumOptionsPerDepartment()
    );
    Inventory.CoursePlans.setMetadata(
      this.hostId,
      Inventory.CoursePlans.Cols.NumComments,
      this.getNumComments()
    );
  }

  private bindToExistingSpreadsheet({ hostId, spreadsheetId }) {
    this.student = Role.Student.getByHostId(hostId);
    this.spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  }

  private getAnchorOffset(): GoogleAppsScript.Spreadsheet.Range;
  private getAnchorOffset(
    rowOffset: number,
    columnOffset: number
  ): GoogleAppsScript.Spreadsheet.Range;
  private getAnchorOffset(
    rowOffset: number,
    columnOffset: number,
    numRows: number,
    numColumns: number
  ): GoogleAppsScript.Spreadsheet.Range;
  private getAnchorOffset(
    rowOffset?: number,
    columnOffset?: number,
    numRows?: number,
    numColumns?: number
  ): GoogleAppsScript.Spreadsheet.Range {
    if (!this.anchor && this.workingCopy) {
      this.anchor = this.workingCopy.getRange('Template_Anchor');
    }
    if (rowOffset !== undefined && columnOffset !== undefined) {
      if (numRows !== undefined && numColumns !== undefined) {
        return this.anchor.offset(rowOffset, columnOffset, numRows, numColumns);
      } else {
        return this.anchor.offset(rowOffset, columnOffset);
      }
    } else {
      return this.anchor;
    }
  }

  private getIndividualEnrollmentHistory = () =>
    SpreadsheetApp.getActive().getSheetByName('Individual Enrollment History');

  private getNumDepartments = () => this.validationSheet.getMaxColumns();

  private getNumOptionsPerDepartment(): number {
    if (this.numOptionsPerDepartment === null) {
      if (Inventory.CoursePlans.has(this.hostId)) {
        this.numOptionsPerDepartment = Inventory.CoursePlans.getMetadata(
          this.hostId,
          Inventory.CoursePlans.Cols.NumOptionsPerDepartment
        );
      } else {
        this.numOptionsPerDepartment = lib.config.getNumOptionsPerDepartment();
      }
    }
    return this.numOptionsPerDepartment;
  }

  private getNumComments(): number {
    if (this.numComments === null) {
      if (Inventory.CoursePlans.has(this.hostId)) {
        this.numComments = Inventory.CoursePlans.getMetadata(
          this.hostId,
          Inventory.CoursePlans.Cols.NumComments
        );
      } else {
        this.numComments = lib.config.getNumComments();
      }
    }
    return this.numComments;
  }

  public updateEnrollmentHistory() {
    this.populateEnrollmentHistory(false);
  }

  private populateEnrollmentHistory(create = true) {
    this.workingCopy = this.planSheet;

    this.setStatus('calculating enrollment history'); // #create, #update-history
    const ieh = this.getIndividualEnrollmentHistory();
    ieh.getRange('IEH_HostID_Selector').setValue(this.hostId);
    const values = ieh
      .getRange('IEH_EnrollmentHistory')
      .offset(
        0,
        0,
        ieh.getRange('IEH_Departments').getNumRows(),
        5 - (this.student.gradYear - CoursePlan.getCurrentSchoolYear())
      )
      .getDisplayValues();
    this.workingCopy = this.planSheet;

    const validations = [];
    const start = ieh
      .getRange('IEH_NumericalYears')
      .getDisplayValues()[0]
      .findIndex((y) => parseInt(y) > CoursePlan.getCurrentSchoolYear());
    if (create) {
      for (let row = 0; row < this.getNumDepartments(); row++) {
        const rowValidation = [];
        for (let year = start; year < 5; year++) {
          rowValidation.push(
            SpreadsheetApp.newDataValidation()
              .requireValueInRange(
                this.validationSheet.getRange('A2:A').offset(0, row)
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
      this.getAnchorOffset(
        0,
        values[0].length,
        validations.length,
        validations[0].length
      ).setDataValidations(validations);

      this.insertAndMergeOptionsRows(values[0].length);
    }

    this.setStatus('publishing enrollment history'); // #create, #update-history
    for (let row = 0; row < values.length; row++) {
      const target = this.getAnchorOffset(
        row * this.getNumOptionsPerDepartment(),
        0,
        1,
        values[row].length
      );
      target.clearDataValidations();
      target.setValues([values[row]]);
    }
  }

  private getFormFolderForPlan = () =>
    Inventory.FormFoldersOfCoursePlans.get(this.student.gradYear);

  public static getFormFolderForStudentFolderFor = (student: Role.Student) =>
    Inventory.FormFoldersOfStudentFolders.get(student.gradYear);

  private getAdvisorFolder = (advisorEmail = this.advisor.email) =>
    Inventory.AdvisorFolders.get(advisorEmail);

  public static getAdvisorFolderFor = (student: Role.Student) =>
    Inventory.AdvisorFolders.get(student.getAdvisor().email);

  private createFromTemplate() {
    this.setStatus('creating course plan from template'); // #create
    const template = SpreadsheetApp.openByUrl(
      lib.config.getCoursePlanTemplate()
    );
    this.spreadsheet = template.copy(
      lib.format.apply(lib.config.getCoursePlanNameFormat(), this.student)
    );
  }

  private populateHeaders() {
    this.setStatus('filling in the labels'); // #create
    g.SpreadsheetApp.Value.set(this.workingCopy, 'Template_Names', [
      [this.student.getFormattedName()],
      [`Advisor: ${this.advisor.getFormattedName()}`]
    ]);
    g.SpreadsheetApp.Value.set(
      this.workingCopy,
      'Template_Years',
      this.getIndividualEnrollmentHistory()
        .getRange('IEH_Years')
        .getDisplayValues()
    );
  }

  private createStudentFolder() {
    this.setStatus('creating student folder'); // #create
    const creating = !Inventory.StudentFolders.has(this.hostId);
    const studentFolder = Inventory.StudentFolders.for(this);
    studentFolder.createShortcut(this.file.getId());
    if (creating) {
      this.getAdvisorFolder().createShortcut(
        Inventory.StudentFolders.for(this).getId()
      );
    }
    g.DriveApp.Permission.add(
      studentFolder.getId(),
      this.student.email,
      g.DriveApp.Permission.Role.Reader
    );
    g.DriveApp.Permission.add(
      studentFolder.getId(),
      this.advisor.email,
      g.DriveApp.Permission.Role.Reader
    );
  }

  public createStudentFolderIfMissing() {
    if (!Inventory.StudentFolders.has(this.hostId)) {
      this.createStudentFolder();

      this.setStatus(
        'replacing plan shortcut with folder shortcut in advisor folder'
      );
      const shortcuts = this.getAdvisorFolder().getFilesByName(
        lib.format.apply(lib.config.getCoursePlanNameFormat(), this.student)
      );
      while (shortcuts.hasNext()) {
        shortcuts.next().setTrashed(true);
      }
      this.getAdvisorFolder().createShortcut(
        Inventory.StudentFolders.for(this).getId()
      );
    }
  }

  private setPermissions() {
    const COL_ADVISOR_FOLDER_PERMISSION = 6;
    this.setStatus('setting permissions'); // #create
    this.file.moveTo(this.getFormFolderForPlan());
    g.DriveApp.Permission.add(this.file.getId(), this.student.email);
    g.DriveApp.Permission.add(this.file.getId(), this.advisor.email);

    if (
      !Inventory.AdvisorFolders.getMetadata(
        this.advisor.email,
        COL_ADVISOR_FOLDER_PERMISSION
      )
    ) {
      g.DriveApp.Permission.add(
        this.getAdvisorFolder().getId(),
        this.advisor.email,
        g.DriveApp.Permission.Role.Reader
      );
      Inventory.AdvisorFolders.setMetadata(
        this.advisor.email,
        COL_ADVISOR_FOLDER_PERMISSION,
        true
      );
    }
  }

  public static getCurrentSchoolYear() {
    if (CoursePlan.currentSchoolyear === null) {
      const now = new Date();
      CoursePlan.currentSchoolyear =
        now.getMonth() > 6 ? now.getFullYear() + 1 : now.getFullYear();
    }
    return CoursePlan.currentSchoolyear;
  }

  // TODO adjust row height to accommodate actual content lines
  private insertAndMergeOptionsRows(valueWidth: number) {
    const numOptions = lib.config.getNumOptionsPerDepartment();
    for (
      let row = 0;
      row < this.getNumDepartments() * numOptions;
      row += numOptions
    ) {
      this.workingCopy.insertRowsAfter(
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
    this.workingCopy.insertRowsAfter(row, this.getNumComments() - 2);
    for (let i = 0; i < this.getNumComments() - 2; i++) {
      this.workingCopy.getRange(row + i + 1, 3, 1, 3).mergeAcross();
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
      const protection = this.workingCopy
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
        editor: this.advisor.email
      },
      {
        name: 'Comments from College Counseling Office',
        range: 'Protect_CollegeCounselingOffice',
        editor: lib.config.getCollegeCounseling()
      }
    ];
    for (const { name, range, editor } of commentors) {
      const protection = this.workingCopy
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
        Inventory.CoursePlans.getSpreadsheet().getSheetByName(
          'Courses by Department'
        )
      );
    }
    return this.coursesByDepartment;
  }

  public updateCourseList() {
    this.setStatus('updating course list'); // #create, #update-courses
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
    const file = this.file;
    this.setStatus('removing from inventory'); // #delete
    Inventory.CoursePlans.remove(this.hostId);

    this.setStatus('trashing shortcuts to plan'); // #delete
    const shortcuts = Inventory.StudentFolders.for(this).getFilesByType(
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

  public expandDeptOptionsIfFewerThanParams() {
    this.workingCopy = this.planSheet;
    const current = this.getNumOptionsPerDepartment();
    const target = lib.config.getNumOptionsPerDepartment();
    if (current < target) {
      for (
        let row =
          this.getAnchorOffset().getRow() +
          this.getNumDepartments() * current -
          1;
        row > this.getAnchorOffset().getRow();
        row -= current
      ) {
        this.planSheet.insertRowsAfter(row, target - current);
      }
    }
    Inventory.CoursePlans.setMetadata(
      this.hostId,
      Inventory.CoursePlans.Cols.NumOptionsPerDepartment,
      target
    );
  }

  public hasNewAdvisor = () =>
    Inventory.CoursePlans.getMetadata(
      this.hostId,
      Inventory.CoursePlans.Cols.NewAdvisor
    );

  public hasPermissionsUpdate = () =>
    Inventory.CoursePlans.getMetadata(
      this.hostId,
      Inventory.CoursePlans.Cols.PermissionsUpdated
    );

  public hasStudentFolderPermissionsUpdate = () =>
    Inventory.StudentFolders.getMetadata(
      this.hostId,
      Inventory.StudentFolders.Cols.PermissionsUpdated
    );

  private updateAdvisorPermissions() {
    const previousAdvisor = this.student.getAdvisor(
      Role.Advisor.ByYear.Previous
    );
    g.DriveApp.Permission.add(
      this.file.getId(),
      this.advisor.email,
      g.DriveApp.Permission.Role.Writer
    );
    const fileName = this.file.getName();
    Logger.log(`Added ${this.advisor.email} as editor to ${fileName}`);
    const protection = this.workingCopy.getRange('Protect_Advisor').protect();
    protection.addEditor(this.advisor.email);
    Logger.log(
      `Added ${this.advisor.email} to Protect_Advisor editors in ${fileName}`
    );
    protection.removeEditor(previousAdvisor.email);
    Logger.log(
      `Removed ${previousAdvisor.email} from Protect_Advisor in ${fileName}`
    );
    this.file.removeEditor(previousAdvisor.email);
    Inventory.CoursePlans.setMetadata(
      this.hostId,
      Inventory.CoursePlans.Cols.PermissionsUpdated,
      true
    );
  }

  private updateStudentFolderPermissions() {
    const previousAdvisor = this.student.getAdvisor(
      Role.Advisor.ByYear.Previous
    );
    const studentFolder = Inventory.StudentFolders.for(this);
    g.DriveApp.Permission.add(
      studentFolder.getId(),
      this.advisor.email,
      g.DriveApp.Permission.Role.Reader
    );
    Logger.log(
      `Added ${this.advisor.email} as viewer to ${studentFolder.getName()}`
    );
    const shortcuts = this.getAdvisorFolder(
      previousAdvisor.email
    ).getFilesByType(MimeType.SHORTCUT);
    while (shortcuts.hasNext()) {
      const shortcut = shortcuts.next();
      if (shortcut.getTargetId() === studentFolder.getId()) {
        shortcut.moveTo(this.getAdvisorFolder());
        Logger.log(
          `Moved ${shortcut.getName()} from ${this.getAdvisorFolder(
            previousAdvisor.email
          ).getName()} to ${this.getAdvisorFolder().getName()}`
        );
      }
    }
    studentFolder.removeViewer(previousAdvisor.email);
    Logger.log(
      `Removed ${previousAdvisor.email
      } as viewer from ${studentFolder.getName()}`
    );
    Inventory.StudentFolders.setMetadata(
      this.hostId,
      Inventory.StudentFolders.Cols.PermissionsUpdated,
      true
    );
  }
}
