import g from '@battis/gas-lighter';
import Role from '../../Role';
import lib from '../../lib';
import Base from '../Base';
import Folders from '../Folders';
import FormFoldersOfCoursePlans from '../FormFoldersOfCoursePlans';
import StudentFolders from '../StudentFolders';
import Inventory from './Inventory';
import Metadata from './Metadata';

class CoursePlan
  extends Base.Item
  implements
  g.HtmlService.Element.Picker.Pickable,
  lib.Progress.Contextable,
  lib.Progress.Sourceable {
  private static readonly protectionDescription = {
    NO_EDITS: 'No Edits',
    COMMENTS_FROM_ADVISOR: 'Comments from Faculty Advisor',
    COMMENTS_FROM_CCO: 'Comments from College Counseling Office'
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

  public get url() {
    return this.spreadsheet.getUrl();
  }

  private _student?: Role.Student;
  public get student() {
    if (!this._student) {
      this._student = Role.Student.get(this.hostId);
    }
    return this._student;
  }
  private set student(student: Role.Student) {
    this._student = student;
    lib.Progress.setStatus('identifying student', this); // #create, #update-enrollment-history, #update-course-list, #delete-student
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

  private _formFolder?: Folders.Folder;
  public get formFolder() {
    if (!this._formFolder) {
      this._formFolder = FormFoldersOfCoursePlans.getInstance().get(
        this.student.gradYear
      );
    }
    return this._formFolder;
  }

  private _spreadsheet?: GoogleAppsScript.Spreadsheet.Spreadsheet;
  public get spreadsheet() {
    if (!this._spreadsheet) {
      if (this.id) {
        this._spreadsheet = SpreadsheetApp.openById(this.id);
      } else {
        throw new Error(`File ID not defined for ${this.key}: ${this}`);
      }
    }
    return this._spreadsheet;
  }
  private set spreadsheet(
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
  ) {
    this._spreadsheet = spreadsheet;
    if (!this._id) {
      this._id = spreadsheet.getId();
    }
  }

  private _file?: GoogleAppsScript.Drive.File;
  public get file(): GoogleAppsScript.Drive.File {
    if (!this._file) {
      if (this.id) {
        this._file = DriveApp.getFileById(this.id);
      } else {
        throw new Error(`Spreadsheet ID not defined for ${this.key}: ${this}`);
      }
    }
    return this._file;
  }
  private set file(file) {
    this._file = file;
    if (!this._id) {
      this._id = file.getId();
    }
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

  private _numOptionsPerDepartment?: number;
  // TODO could this be pulled by looking at merged cells?
  private get numOptionsPerDepartment() {
    if (this._numOptionsPerDepartment == null) {
      if (
        this.inventory.has(this.hostId) &&
        this.meta.numOptionsPerDepartment // might still be an incomplete plan!
      ) {
        this._numOptionsPerDepartment = this.meta.numOptionsPerDepartment;
      } else {
        this._numOptionsPerDepartment = lib.Parameters.numOptionsPerDepartment;
      }
    }
    return this._numOptionsPerDepartment;
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

  public assignToCurrentAdvisor() {
    if (this.meta.newAdvisor && !this.meta.permissionsUpdated && this.advisor) {
      lib.Progress.setStatus(`updating course plan permissions`, this, {
        current: this.advisor.email,
        previous: this.student.previousAdvisor?.email
      }); // #assign-to-current-advisor
      this.setPermissions();
      this.setCommentEditors(false);
      this.removePreviousAdvisor(); // FIXME should probably just deactivate and then reassign?
      this.updateNames();
      this.meta.permissionsUpdated = true;
    }
    this.student.folder.assignToCurrentAdvisor();
  }

  private removePreviousAdvisor() {
    if (this.student.previousAdvisor) {
      lib.Progress.setStatus('removing previous advisor permissions', this); // #assign-to-current-advisor
      const protections = this.planSheet.getProtections(
        SpreadsheetApp.ProtectionType.RANGE
      );
      for (const protection of protections) {
        const editors = protection.getEditors();
        for (const editor of editors) {
          if (editor.getEmail() === this.student.previousAdvisor.email) {
            protection.removeEditor(this.student.previousAdvisor.email);
          }
        }
      }
      try {
        this.file.removeEditor(this.student.previousAdvisor.email);
        lib.Progress.setStatus(
          'removed previous advisor as a course plan editor',
          this
        ); // #assign-to-current-advisor (1 of 2)
      } catch (e) {
        lib.Progress.setStatus(
          'previous advisor was not a course plan editor',
          this
        ); // (2 of 2)
      }
    } else {
      lib.Progress.progress.incrementValue();
    }
  }

  public deactivate() {
    if (this.meta.inactive && !this.meta.permissionsUpdated) {
      try {
        this.file.removeEditor(this.student.previousAdvisor.email);
        lib.Progress.setStatus('removed previous advisor as editor', this); // #deactivate (1 of 2)
      } catch (e) {
        lib.Progress.setStatus(
          `previous advisor was not a course plan editor`,
          this
        ); // (2 of 2)
      }

      this.meta.permissionsUpdated = true;
    }
    StudentFolders.Inventory.getInstance().get(this.hostId).deactivate();
  }

  public resetPermissions() {
    if (this.meta.active) {
      this.setPermissions();
      this.setCommentEditors(false);
    }
  }

  public expandComments() {
    this.expandCommentsIn(lib.CoursePlanTemplate.namedRange.ProtectAdvisor);
    this.expandCommentsIn(
      lib.CoursePlanTemplate.namedRange.ProtectCollegeCounseling
    );
  }

  private expandCommentsIn(namedRange: string) {
    const oldRange = this.planSheet.getRange(namedRange);
    const existingComments = oldRange
      .getValues()
      .filter(
        (row) => !row.reduce((isEmpty, cell) => isEmpty && cell === '', true)
      );
    const additionalComments =
      existingComments.length +
      lib.Parameters.numComments -
      oldRange.getNumRows();
    const pretty = namedRange
      .replace('Protect_', '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase();
    if (additionalComments > 0) {
      lib.Progress.setStatus(
        `adding ${additionalComments} comments to ${pretty}`,
        this
      );
      this.additionalComments(oldRange.getRow(), additionalComments);
      const newRange = this.planSheet.getRange(namedRange);
      newRange.clearContent();
      newRange
        .offset(0, 0, existingComments.length)
        .setValues(existingComments);
    } else {
      lib.Progress.setStatus(`${pretty} has enough empty rows`, this);
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
    this.updateCourseList();
    this.setPermissions();
    this.setCommentEditors(); // must happen after permissions
    this.createFolders();

    lib.Progress.setStatus('completing plan creation', this); // #create
    this.meta.incomplete = false;
  }

  private createFromTemplate() {
    lib.Progress.setStatus('creating course plan from template', this); // #create
    const template = SpreadsheetApp.openByUrl(lib.Parameters.planTemplateUrl);
    this.spreadsheet = template.copy(
      lib.Format.apply(lib.Parameters.nameFormat.coursePlan, this.student)
    );
    this.file = DriveApp.getFileById(this.spreadsheet.getId());

    lib.Progress.setStatus('adding plan to inventory', this); // #create
    this.inventory.add(this);
    this.meta.incomplete = true;
    this.meta.numOptionsPerDepartment = this.numOptionsPerDepartment;
    this.meta.version = APP_VERSION;
  }

  private populateEnrollmentHistory(create = true) {
    lib.Progress.setStatus('calculating enrollment history', this); // #create, #update-enrollment-history
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
      this.protectNonCommentRanges(values[0].length, values.length);

      lib.Progress.setStatus('configuring data validation', this); // #create
      this.getAnchorOffset(
        0,
        values[0].length,
        validations.length,
        validations[0].length
      ).setDataValidations(validations);

      this.insertOptionsRows();
    } else {
      lib.Progress.setStatus('expanding data protection', this); // #update-enrollment-history
      const protections = this.planSheet.getProtections(
        SpreadsheetApp.ProtectionType.RANGE
      );
      for (const protection of protections) {
        if (
          protection.getRange().getRow() ===
          this.getAnchorOffset(0, 0).getRow() &&
          protection.getRange().getColumn() ===
          this.getAnchorOffset(0, 0).getColumn()
        ) {
          protection.setRange(
            this.getAnchorOffset(
              0,
              0,
              this.numDepartments * this.numOptionsPerDepartment,
              values[0].length
            )
          );
        }
      }
    }
    this.mergeEnrollmentHistoryRows(values[0].length);

    lib.Progress.setStatus('publishing enrollment history', this); // #create, #update-enrollment-history
    for (let row = 0; row < values.length; row++) {
      const target = this.getAnchorOffset(
        row * this.numOptionsPerDepartment,
        0,
        1,
        values[row].length
      );
      target.clearDataValidations();
      target.setValues([values[row]]);
    }
  }

  private updateNames() {
    lib.Progress.setStatus('updating advisor on course plan', this); // #create, #assign-to-current-advisor
    g.SpreadsheetApp.Value.set(
      this.planSheet,
      lib.CoursePlanTemplate.namedRange.TemplateNames,
      [
        [this.student.formattedName],
        [`Advisor: ${this.advisor?.formattedName || ''}`]
      ]
    );
  }

  private populateHeaders() {
    lib.Progress.setStatus('filling in the labels', this); // #create
    this.updateNames();
    g.SpreadsheetApp.Value.set(
      this.planSheet,
      lib.CoursePlanTemplate.namedRange.TemplateYears,
      this.individualEnrollmentHistory
        .getRange(lib.CoursePlanningData.namedRange.IEHYears)
        .getDisplayValues()
    );
  }

  private setPermissions() {
    if (this.meta.active) {
      lib.Progress.setStatus('giving student and advisor access to plan', this); // #create, #reset-course-plan-permissions, #assign-to-current-advisor (A: 1 of 2)
      g.DriveApp.Permission.add(this.file.getId(), this.student.email);
      if (this.advisor) {
        g.DriveApp.Permission.add(this.file.getId(), this.advisor.email);
      }
      lib.Progress.setStatus(
        'giving student and advisor access to student folder',
        this
      ); // #create, #reset-course-plan-permissions, #assign-to-current-advisor (B: 1 of 2)
      this.student.folder.resetPermissions();
    } else {
      lib.Progress.progress.incrementValue(2); // A, B (2 of 2)
    }
  }

  public createFolders() {
    lib.Progress.setStatus('moving original plan to form folder', this); // #create
    this.file.moveTo(this.formFolder.driveFolder);

    lib.Progress.setStatus('adding shortcut in student folder', this); // #create
    this.student.folder.driveFolder.createShortcut(this.file.getId());

    lib.Progress.setStatus('adding shortcut to advisor folder', this); // #create
    this.student.folder.assignToCurrentAdvisor();
  }

  private setCommentEditors(create = true) {
    lib.Progress.setStatus('setting comment editors', this); // #create, #reset-course-plan-permissions, #assign-to-current-advisor
    const commentors = [
      {
        name: CoursePlan.protectionDescription.COMMENTS_FROM_ADVISOR,
        range: lib.CoursePlanTemplate.namedRange.ProtectAdvisor,
        editors: [this.advisor?.email, lib.Parameters.email.academicOffice]
      },
      {
        name: CoursePlan.protectionDescription.COMMENTS_FROM_CCO,
        range: lib.CoursePlanTemplate.namedRange.ProtectCollegeCounseling,
        editors: [lib.Parameters.email.collegeCounseling]
      }
    ];
    let protections: GoogleAppsScript.Spreadsheet.Protection[];
    if (!create) {
      protections = this.planSheet.getProtections(
        SpreadsheetApp.ProtectionType.RANGE
      );
    }
    for (const { name, range, editors } of commentors) {
      let protection: GoogleAppsScript.Spreadsheet.Protection;
      if (create) {
        protection = this.planSheet
          .getRange(range)
          .protect()
          .setDescription(name);
      } else {
        for (const p of protections) {
          if (p.getDescription() == name) {
            protection = p;
          }
        }
      }
      g.SpreadsheetApp.Protection.clearEditors(protection);
      editors.forEach((editor) => {
        try {
          protection.addEditor(editor);
        } catch (e) {
          // guessing that an undefined advisor will throw an error -- which we will ignore
        }
      });
      if (create) {
        this.additionalComments(protection.getRange().getRow());
      }
    }
  }

  public updateCourseList() {
    lib.Progress.setStatus('updating course list', this); // #create, #update-course-list
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
  private insertOptionsRows() {
    const numOptions = lib.Parameters.numOptionsPerDepartment;
    for (
      let row = 0;
      row < this.numDepartments * numOptions;
      row += numOptions
    ) {
      this.planSheet.insertRowsAfter(
        this.getAnchorOffset().getRow() + row,
        numOptions - 1
      );
    }
  }

  private mergeEnrollmentHistoryRows(valueWidth: number) {
    for (
      let row = 0;
      row < this.numDepartments * this.numOptionsPerDepartment;
      row += this.numOptionsPerDepartment
    ) {
      this.getAnchorOffset(
        row,
        -1,
        this.numOptionsPerDepartment,
        valueWidth + 1
      ).mergeVertically();
    }
  }

  private additionalComments(
    row: number,
    numAdditionalComments = lib.Parameters.numComments - 2
  ) {
    this.planSheet.insertRowsAfter(row, numAdditionalComments);
    for (let i = 0; i < numAdditionalComments; i++) {
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
        .setDescription(CoursePlan.protectionDescription.NO_EDITS);
      g.SpreadsheetApp.Protection.clearEditors(protection);
    }
  }

  public expandDeptOptionsIfFewerThanParams() {
    const current = this.numOptionsPerDepartment;
    const target = lib.Parameters.numOptionsPerDepartment;
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

  public toString(): string {
    const arr: { [k: string]: any } = {};
    for (const prop in this) {
      arr[prop] = typeof this[prop] === 'object' ? 'object' : this[prop];
    }
    return JSON.stringify(arr);
  }

  public toOption(): g.HtmlService.Element.Picker.Option {
    return { name: this.student.formattedName, value: this.hostId };
  }

  public toSourceString(): string {
    return this.student.formattedName;
  }

  public toContext(): { [key: string]: any } {
    return { type: 'course plan', id: this.id, hostId: this.hostId };
  }

  public delete() {
    const file = this.file;
    lib.Progress.setStatus('removing plan from inventory', this); // #delete-student
    this.inventory.remove(this.hostId);

    lib.Progress.setStatus('moving shortcuts to trash', this); // #delete-student
    this.student.folder.delete();

    lib.Progress.setStatus('moving plan to trash', this); // #delete-student
    file.setTrashed(true);
  }
}

namespace CoursePlan { }

export { CoursePlan as default };
