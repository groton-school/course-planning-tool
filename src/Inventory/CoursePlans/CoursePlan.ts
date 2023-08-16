import g from '@battis/gas-lighter';
import Role from '../../Role';
import lib from '../../lib';
import Base from '../Base';
import FormFoldersOfCoursePlans from '../FormFoldersOfCoursePlans';
import StudentFolders from '../StudentFolders';
import Metadata from './/Metadata';
import Inventory from './Inventory';

class CoursePlan
  extends Base.Item
  implements
  g.HtmlService.Element.Picker.Pickable,
  lib.Progress.Contextable,
  lib.Progress.Sourceable {
  public static stepCount = {
    create: parseInt(CREATE_STEPS),
    updateEnrollmentHistory: parseInt(UPDATE_HISTORY_STEPS),
    updateCourseList: parseInt(UPDATE_COURSES_STEPS),
    delete: parseInt(DELETE_STEPS),
    reassign: parseInt(REASSIGN_STEPS),
    inactive: parseInt(INACTIVE_STEPS)
  };

  private static _coursesByDepartment: any[][];
  private static get coursesByDepartment(): string[][] {
    if (!this._coursesByDepartment) {
      this._coursesByDepartment = g.SpreadsheetApp.Value.getSheetDisplayValues(
        SpreadsheetApp.getActive().getSheetByName(
          lib.CoursePlanningData.sheet.CoursesByDepartment
        )
      );
    }
    return this._coursesByDepartment;
  }

  public meta = new Metadata(this.inventory as Inventory, this.key);

  private _student?: Role.Student;
  public get student() {
    if (!this._student) {
      this._student = Role.Student.getByHostId(this.hostId);
      if (!this._student) {
        Logger.log('attempting to find student in previous year', this);
        this._student = Role.Student.getByHostId(
          this.hostId,
          Role.Year.Previous
        );
      }
    }
    return this._student;
  }
  private set student(student: Role.Student) {
    this._student = student;
    lib.Progress.setStatus('identifying student', this); // #create, #update-history, #update-courses, #delete
  }
  public get hostId() {
    return this.key.toString();
  }

  private _advisor?: Role.Advisor;
  public get advisor() {
    if (!this._advisor && this.student) {
      this._advisor = this.student.advisor;
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

  private _spreadsheet?: GoogleAppsScript.Spreadsheet.Spreadsheet;
  public get spreadsheet() {
    if (!this._spreadsheet) {
      if (this.id) {
        this._spreadsheet = SpreadsheetApp.openById(this.id);
      } else {
        throw new Error(`File ID not defined for Host ID ${this.key}`);
      }
    }
    return this._spreadsheet;
  }
  private set spreadsheet(
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
  ) {
    this._spreadsheet = spreadsheet;
    // FIXME does this.id need to be updated?
  }

  private _file?: GoogleAppsScript.Drive.File;
  public get file(): GoogleAppsScript.Drive.File {
    if (!this._file) {
      if (this.id) {
        this._file = DriveApp.getFileById(this.id);
      } else {
        throw new Error(`Spreadsheet ID not defined for Host ID ${this.key}`);
      }
    }
    return this._file;
  }
  private set file(file) {
    this._file = file;
    // FIXME does this.id need to be updated?
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
  // TODO could this be pulled by looking at merged cells?
  private getNumOptionsPerDepartment(): number {
    if (this.numOptionsPerDepartment === null) {
      if (this.inventory.has(this.hostId)) {
        this.numOptionsPerDepartment = this.meta.numOptionsPerDepartment;
      } else {
        this.numOptionsPerDepartment = lib.Config.getNumOptionsPerDepartment();
      }
    }
    return this.numOptionsPerDepartment;
  }

  private numComments?: number = null;
  // TODO could this be pulled from the data protection model?
  private getNumComments(): number {
    if (this.numComments === null) {
      if (this.inventory.has(this.hostId)) {
        this.numComments = this.meta.numComments;
      } else {
        this.numComments = lib.Config.getNumComments();
      }
    }
    return this.numComments;
  }

  public constructor(
    inventory: Inventory,
    content: string | Role.Student,
    hostId: Base.Inventory.Key
  ) {
    super(inventory, content instanceof Role.Student ? null : content, hostId);
    if (content instanceof Role.Student) {
      this.createFromStudent(content);
    }
  }

  public assignToCurrentAdvisor(previousAdvisor?: Role.Advisor) {
    const primary = !previousAdvisor;
    previousAdvisor =
      previousAdvisor || this.student.getAdvisor(Role.Year.Previous);
    if (this.meta.newAdvisor && !this.meta.permissionsUpdated) {
      lib.Progress.setStatus(`updating course plan permissions`, this, {
        current: this.advisor.email,
        previous: previousAdvisor.email
      }); // #reassign
      g.DriveApp.Permission.add(
        this.file.getId(),
        this.advisor.email,
        g.DriveApp.Permission.Role.Writer
      );
      const protections = this.planSheet.getProtections(
        SpreadsheetApp.ProtectionType.RANGE
      );
      for (const protection of protections) {
        const editors = protection.getEditors();
        for (const editor of editors) {
          if (editor.getEmail() === previousAdvisor.email) {
            protection.addEditor(this.advisor.email);
            protection.removeEditor(previousAdvisor.email);
          }
        }
      }
      try {
        this.file.removeEditor(previousAdvisor.email);
      } catch (e) {
        lib.Progress.log(
          `${previousAdvisor.email} was not a course plan editor`,
          this
        );
      }

      lib.Progress.setStatus('updating advisor on course plan', this); // #reassign
      g.SpreadsheetApp.Value.set(
        this.planSheet,
        lib.CoursePlanTemplate.namedRange.TemplateNames,
        [
          [this.student.getFormattedName()],
          [`Advisor: ${this.advisor.getFormattedName()}`]
        ]
      );

      this.meta.permissionsUpdated = true;
    }
    if (primary) {
      this.student.folder.assignToCurrentAdvisor(previousAdvisor);
    }
  }

  public makeInactive(previousAdvisor?: Role.Advisor) {
    const primary = !previousAdvisor;
    previousAdvisor =
      previousAdvisor || this.student.getAdvisor(Role.Year.Previous);
    if (this.meta.inactive && !this.meta.permissionsUpdated) {
      lib.Progress.setStatus('removing previous advisor', this); // #inactive
      try {
        this.file.removeEditor(previousAdvisor.email);
      } catch (e) {
        lib.Progress.log(
          `${previousAdvisor.email} as not a course plan editor`,
          this
        );
      }

      this.meta.permissionsUpdated = true;
    }
    if (primary) {
      this.student.folder.makeInactive(previousAdvisor);
    }
  }

  public updateEnrollmentHistory() {
    this.populateEnrollmentHistory(false);
  }

  private createFromStudent(student: Role.Student) {
    this.student = student;
    this.createFromTemplate();
    this.populateEnrollmentHistory();
    this.populateHeaders();
    this.setPermissions();
    this.putInPlace();
    this.prepareCommentBlanks();
    this.updateCourseList();
    lib.Progress.setStatus('updating inventory', this); // #create
    this.inventory.add([
      this.hostId,
      this.spreadsheet.getId(),
      this.spreadsheet.getUrl()
    ]);
    this.meta.numOptionsPerDepartment = this.getNumOptionsPerDepartment();
    this.meta.numComments = this.getNumComments();
    this.meta.version = APP_VERSION;
  }

  private createFromTemplate() {
    lib.Progress.setStatus('creating course plan from template', this); // #create
    const template = SpreadsheetApp.openByUrl(
      lib.Config.getCoursePlanTemplate()
    );
    this.spreadsheet = template.copy(
      lib.Format.apply(lib.Config.getCoursePlanNameFormat(), this.student)
    );
    this.file = DriveApp.getFileById(this.spreadsheet.getId());
  }

  private populateEnrollmentHistory(create = true) {
    lib.Progress.setStatus('calculating enrollment history', this); // #create, #update-history
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

      lib.Progress.setStatus('configuring data validation', this); // #create
      this.getAnchorOffset(
        0,
        values[0].length,
        validations.length,
        validations[0].length
      ).setDataValidations(validations);

      this.insertAndMergeOptionsRows(values[0].length);
    }

    lib.Progress.setStatus('publishing enrollment history', this); // #create, #update-history
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

  private populateHeaders() {
    lib.Progress.setStatus('filling in the labels', this); // #create
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
    lib.Progress.setStatus('setting permissions', this); // #create
    this.file.moveTo(this.formFolder);
    g.DriveApp.Permission.add(this.file.getId(), this.student.email);
    g.DriveApp.Permission.add(this.file.getId(), this.advisor.email);
  }

  public putInPlace() {
    lib.Progress.setStatus('filing in student folder', this); // #create
    const creating = !StudentFolders.Inventory.getInstance().has(this.hostId);
    const { studentFolder } = StudentFolders.Inventory.getInstance().get(
      this.hostId
    );
    studentFolder.createShortcut(this.file.getId());
    if (creating) {
      this.advisor.folder.createShortcut(studentFolder.getId());
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

  private prepareCommentBlanks() {
    lib.Progress.setStatus('making room for comments', this); // #create
    const commentors = [
      {
        name: 'Comments from Faculty Advisor',
        range: lib.CoursePlanTemplate.namedRange.ProtectAdvisor,
        editor: this.advisor.email
      },
      {
        name: 'Comments from College Counseling Office',
        range: lib.CoursePlanTemplate.namedRange.ProtectCollegeCounseling,
        editor: lib.Config.getCollegeCounseling()
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

  public updateCourseList() {
    lib.Progress.setStatus('updating course list', this); // #create, #update-courses
    const source = CoursePlan.coursesByDepartment;
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

  // TODO adjust row height to accommodate actual content lines
  private insertAndMergeOptionsRows(valueWidth: number) {
    const numOptions = lib.Config.getNumOptionsPerDepartment();
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
    lib.Progress.setStatus('protecting data', this); // #create
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

  public expandDeptOptionsIfFewerThanParams() {
    const current = this.getNumOptionsPerDepartment();
    const target = lib.Config.getNumOptionsPerDepartment();
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

  public toOption(): g.HtmlService.Element.Picker.Option {
    return { name: this.student.getFormattedName(), value: this.hostId };
  }

  public toSourceString(): string {
    return this.student.getFormattedName();
  }

  public toContext(): { [key: string]: any } {
    return { type: 'course plan', id: this.id, hostId: this.hostId };
  }

  public delete() {
    const file = this.file;
    lib.Progress.setStatus('removing from inventory', this); // #delete
    this.inventory.remove(this.hostId);

    lib.Progress.setStatus('trashing shortcuts to plan', this); // #delete
    const shortcuts = StudentFolders.Inventory.getInstance()
      .get(this.hostId)
      .folder.getFilesByType(MimeType.SHORTCUT);
    while (shortcuts.hasNext()) {
      const shortcut = shortcuts.next();
      if (shortcut.getTargetId() == file.getId()) {
        shortcut.setTrashed(true);
      }
    }

    lib.Progress.setStatus('trashing plan', this); // #delete
    file.setTrashed(true);
  }
}

namespace CoursePlan { }

export { CoursePlan as default };
