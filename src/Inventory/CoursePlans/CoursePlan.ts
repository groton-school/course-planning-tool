import g from '@battis/gas-lighter';
import CoursePlans from '.';
import lib from '../../lib';
import Role from '../../Role';
import Base from '../Base';
import FormFoldersOfCoursePlans from '../FormFoldersOfCoursePlans';
import StudentFolders from '../StudentFolders';
import Metadata from './/Metadata';
import Inventory from './Inventory';

class CoursePlan extends Base.Item {
  public static stepCount = {
    create: parseInt(CREATE_STEPS),
    updateEnrollmentHistory: parseInt(UPDATE_HISTORY_STEPS),
    updateCourseList: parseInt(UPDATE_COURSES_STEPS),
    delete: parseInt(DELETE_STEPS)
  };

  public static thread = Utilities.getUuid();

  private static coursesByDepartment: any[][];

  public meta = new Metadata(this.inventory as Inventory, this.key);

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

  private _formFolder?: GoogleAppsScript.Drive.Folder;
  public get formFolder() {
    if (!this._formFolder) {
      this._formFolder = FormFoldersOfCoursePlans.getInstance().get(
        this.student.gradYear
      ).folder;
    }
    return this._formFolder;
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

  public get file(): GoogleAppsScript.Drive.File {
    return this.content;
  }
  private set file(file) {
    this._content = file;
  }

  private _anchor?: GoogleAppsScript.Spreadsheet.Range;
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
    if (!this._anchor) {
      this._anchor = this.planSheet.getRange('Template_Anchor');
    }
    if (rowOffset !== undefined && columnOffset !== undefined) {
      if (numRows !== undefined && numColumns !== undefined) {
        return this._anchor.offset(
          rowOffset,
          columnOffset,
          numRows,
          numColumns
        );
      } else {
        return this._anchor.offset(rowOffset, columnOffset);
      }
    } else {
      return this._anchor;
    }
  }

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
        lib.CoursePlanningData.sheet.CoursesByDepartment
      );
    }
    return this._validationSheet;
  }

  private get numDepartments() {
    return this.validationSheet.getMaxColumns();
  }

  private get individualEnrollmentHistory() {
    return SpreadsheetApp.getActive().getSheetByName(
      lib.CoursePlanningData.sheet.IndividualEnrollmentHistory
    );
  }

  private numOptionsPerDepartment?: number = null;
  private numComments?: number = null;

  public static bindTo({
    hostId,
    spreadsheetId,
    student,
    spreadsheet
  }: CoursePlan.BindToImplementation): CoursePlan {
    hostId = hostId || student.hostId;
    spreadsheetId = spreadsheetId || spreadsheet.getId();
    return new CoursePlan(
      CoursePlans.getInstance(),
      DriveApp.getFileById(spreadsheetId),
      hostId
    );
  }

  public static for(hostId: string): CoursePlan;
  public static for(student: Role.Student): CoursePlan;
  public static for(target: string | Role.Student): CoursePlan {
    if (typeof target === 'string') {
      return CoursePlans.getInstance().get(target);
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

  public constructor(
    inventory: Inventory,
    obj: GoogleAppsScript.Drive.File | Role.Student,
    hostId: Base.Inventory.Key
  ) {
    super(inventory, obj instanceof Role.Student ? null : obj, hostId);
    if (obj instanceof Role.Student) {
      this.createFromStudent(obj);
    }
  }

  private createFromStudent(student: Role.Student) {
    this.student = student;
    this.createFromTemplate();
    this.populateEnrollmentHistory();
    this.populateHeaders();
    this.setPermissions();
    StudentFolders.getInstance().putInPlace(this, CoursePlan.thread); // #create
    this.prepareCommentBlanks();
    this.updateCourseList();
    this.setStatus('updating inventory'); // #create
    this.inventory.add([
      this.hostId,
      this.spreadsheet.getId(),
      this.spreadsheet.getUrl()
    ]);
    this.meta.numOptionsPerDepartment = this.getNumOptionsPerDepartment();
    this.meta.numComments = this.getNumComments();
    this.meta.version = APP_VERSION;
  }

  private bindToExistingSpreadsheet({
    hostId,
    spreadsheetId,
    student,
    spreadsheet
  }: CoursePlan.BindToImplementation) {
    if ((!student && !hostId) || (!spreadsheet && !spreadsheetId)) {
      throw new Error(
        `Insufficient data to bind CoursePlan ${JSON.stringify({
          hostId,
          spreadsheetId,
          student,
          spreadsheet
        })}`
      );
    }
    this.student = student || Role.Student.getByHostId(hostId.toString());
    this.spreadsheet = spreadsheet || SpreadsheetApp.openById(spreadsheetId);
  }

  // TODO could this be pulled by looking at merged cells?
  private getNumOptionsPerDepartment(): number {
    if (this.numOptionsPerDepartment === null) {
      if (this.inventory.has(this.hostId)) {
        this.numOptionsPerDepartment = this.meta.numOptionsPerDepartment;
      } else {
        this.numOptionsPerDepartment = lib.config.getNumOptionsPerDepartment();
      }
    }
    return this.numOptionsPerDepartment;
  }

  // TODO could this be pulled from the data protection model?
  private getNumComments(): number {
    if (this.numComments === null) {
      if (this.inventory.has(this.hostId)) {
        this.numComments = this.meta.numComments;
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
    this.setStatus('calculating enrollment history'); // #create, #update-history
    const ieh = this.individualEnrollmentHistory;
    ieh
      .getRange(lib.CoursePlanningData.namedRange.IEHHostIdSelector)
      .setValue(this.hostId);
    const values = ieh
      .getRange(lib.CoursePlanningData.namedRange.IEHEnrollmentHistory)
      .offset(
        0,
        0,
        ieh
          .getRange(lib.CoursePlanningData.namedRange.IEHDepartments)
          .getNumRows(),
        5 - (this.student.gradYear - lib.currentSchoolYear())
      )
      .getDisplayValues();

    const validations = [];
    const start = ieh
      .getRange(lib.CoursePlanningData.namedRange.IEHNumericalYears)
      .getDisplayValues()[0]
      .findIndex((y) => parseInt(y) > lib.currentSchoolYear());
    if (create) {
      for (let row = 0; row < this.numDepartments; row++) {
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

  private createFromTemplate() {
    this.setStatus('creating course plan from template'); // #create
    const template = SpreadsheetApp.openByUrl(
      lib.config.getCoursePlanTemplate()
    );
    this.spreadsheet = template.copy(
      lib.format.apply(lib.config.getCoursePlanNameFormat(), this.student)
    );
    this.file = DriveApp.getFileById(this.spreadsheet.getId());
  }

  private populateHeaders() {
    this.setStatus('filling in the labels'); // #create
    g.SpreadsheetApp.Value.set(
      this.planSheet,
      lib.CoursePlanTemplate.namedRange.TemplateNames,
      [
        [this.student.getFormattedName()],
        [`Advisor: ${this.advisor.getFormattedName()}`]
      ]
    );
    g.SpreadsheetApp.Value.set(
      this.planSheet,
      lib.CoursePlanTemplate.namedRange.TemplateYears,
      this.individualEnrollmentHistory
        .getRange(lib.CoursePlanningData.namedRange.IEHYears)
        .getDisplayValues()
    );
  }

  private setPermissions() {
    this.setStatus('setting permissions'); // #create
    this.file.moveTo(this.formFolder);
    g.DriveApp.Permission.add(this.file.getId(), this.student.email);
    g.DriveApp.Permission.add(this.file.getId(), this.advisor.email);
  }

  // TODO adjust row height to accommodate actual content lines
  private insertAndMergeOptionsRows(valueWidth: number) {
    const numOptions = lib.config.getNumOptionsPerDepartment();
    for (
      let row = 0;
      row < this.numDepartments * numOptions;
      row += numOptions
    ) {
      this.planSheet.insertRowsAfter(
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
    this.planSheet.insertRowsAfter(row, this.getNumComments() - 2);
    for (let i = 0; i < this.getNumComments() - 2; i++) {
      this.planSheet.getRange(row + i + 1, 3, 1, 3).mergeAcross();
    }
  }

  private protectNonCommentRanges(historyWidth: number, historyHeight: number) {
    this.setStatus('protecting data'); // #create
    const history = this.getAnchorOffset(0, 0, historyHeight, historyWidth);
    for (const range of [
      history.getA1Notation(),
      lib.CoursePlanTemplate.namedRange.ProtectLeftMargin,
      lib.CoursePlanTemplate.namedRange.ProtectTopMargin,
      lib.CoursePlanTemplate.namedRange.ProtectBetweenComments
    ]) {
      const protection = this.planSheet
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
        range: lib.CoursePlanTemplate.namedRange.ProtectAdvisor,
        editor: this.advisor.email
      },
      {
        name: 'Comments from College Counseling Office',
        range: lib.CoursePlanTemplate.namedRange.ProtectCollegeCounseling,
        editor: lib.config.getCollegeCounseling()
      }
    ];
    for (const { name, range, editor } of commentors) {
      const protection = this.planSheet
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
        SpreadsheetApp.getActive().getSheetByName(
          lib.CoursePlanningData.sheet.CoursesByDepartment
        )
      );
    }
    return this.coursesByDepartment;
  }

  public updateCourseList() {
    this.setStatus('updating course list'); // #create, #update-courses
    const source = CoursePlan.getCoursesByDepartment();
    const destination = this.spreadsheet.getSheetByName(
      lib.CoursePlanningData.sheet.CoursesByDepartment
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
    this.inventory.remove(this.hostId);

    this.setStatus('trashing shortcuts to plan'); // #delete
    const shortcuts = StudentFolders.getInstance()
      .for(this)
      .folder.getFilesByType(MimeType.SHORTCUT);
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
    const current = this.getNumOptionsPerDepartment();
    const target = lib.config.getNumOptionsPerDepartment();
    if (current < target) {
      for (
        let row =
          this.getAnchorOffset().getRow() + this.numDepartments * current - 1;
        row > this.getAnchorOffset().getRow();
        row -= current
      ) {
        this.planSheet.insertRowsAfter(row, target - current);
      }
    }
    this.meta.numOptionsPerDepartment = target;
  }

  public assignToCurrentAdvisor(primary = true) {
    if (this.meta.newAdvisor && !this.meta.permissionsUpdated) {
      const previousAdvisor = this.student.getAdvisor(
        Role.Advisor.ByYear.Previous
      );
      g.DriveApp.Permission.add(
        this.file.getId(),
        this.advisor.email,
        g.DriveApp.Permission.Role.Writer
      );
      const protection = this.planSheet
        .getRange(lib.CoursePlanTemplate.namedRange.ProtectAdvisor)
        .protect();
      protection.addEditor(this.advisor.email);
      protection.removeEditor(previousAdvisor.email);
      this.file.removeEditor(previousAdvisor.email);

      g.SpreadsheetApp.Value.set(
        this.planSheet,
        lib.CoursePlanTemplate.namedRange.TemplateNames,
        [
          [this.student.getFormattedName()],
          [`Advisor: ${this.advisor.getFormattedName()}`]
        ]
      );
      this.meta.permissionsUpdated = true;
      if (primary) {
        this.student.folder.assignToCurrentAdvisor(false);
      }
    }
  }

  public makeInactive(primary = true) {
    if (this.meta.inactive && !this.meta.permissionsUpdated) {
      const previousAdvisor = this.student.getAdvisor(
        Role.Advisor.ByYear.Previous
      );
      this.file.removeEditor(previousAdvisor.email);

      this.meta.permissionsUpdated = true;
      if (primary) {
        this.student.folder.makeInactive(false);
      }
    }
  }
}

namespace CoursePlan {
  export type BindToImplementation = (
    | { student: Role.Student; hostId?: never }
    | { student?: never; hostId: Base.Inventory.Key }
  ) &
    (
      | {
        spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
        spreadsheetId?: never;
      }
      | { spreadsheet?: never; spreadsheetId: string }
    );
}

export { CoursePlan as default };
