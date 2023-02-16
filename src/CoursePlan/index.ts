import { Helper, Terse } from '@battis/gas-lighter';
import Advisor from '../Advisor';
import * as Constants from '../Constants';
import * as SheetParameters from '../SheetParameters';
import Student from '../Student';
import FolderInventory from './FolderInventory';
import Inventory, { Key as InventoryKey } from './Inventory';

const s = Helper.SpreadsheetApp;

class CoursePlanInventory extends Inventory<CoursePlan> {
    protected getter = (id: string, key?: InventoryKey): CoursePlan =>
        CoursePlan.bindTo(id, key);

    // added to Inventory by CoursePlan constructor directly
    protected creator = (key: InventoryKey): CoursePlan =>
        new CoursePlan(Student.getByHostId(key.toString()));
}

// TODO modify workflow to allow for updating enrollment history on existing course plans
export default class CoursePlan {
    private static readonly META_NUM_COMMENTS = `${Constants.PREFIX}.CoursePlan.numComments`;
    private static readonly META_NUM_OPTIONS_PER_DEPT = `${Constants.PREFIX}.CoursePlan.numOptionsPerDept`;
    private static readonly META_CURRENT_SCHOOL_YEAR = `${Constants.PREFIX}.CoursePlan.currentSchoolYear`;

    private static formFolderInventory = new FolderInventory(
        'Form Folder Inventory',
        (gradYear) =>
            CoursePlan.applyFormat(SheetParameters.getFormFolderNameFormat(), {
                gradYear,
            })
    );
    private static advisorFolderInventory = new FolderInventory(
        'Advisor Folder Inventory',
        (email) =>
            CoursePlan.applyFormat(
                SheetParameters.getAdvisorFolderNameFormat(),
                Advisor.getByEmail(email.toString())
            )
    );
    private static coursePlanInventory = new CoursePlanInventory(
        'Course Plan Inventory'
    );
    private static me?: GoogleAppsScript.Base.User;

    private student: Student;
    private advisor: Advisor;
    private spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
    private file: GoogleAppsScript.Drive.File;
    private workingCopy?: GoogleAppsScript.Spreadsheet.Sheet;
    private anchor?: GoogleAppsScript.Spreadsheet.Range;
    private validationSheet?: GoogleAppsScript.Spreadsheet.Sheet;

    public static bindTo = (
        spreadsheetId: string,
        hostId: InventoryKey
    ): CoursePlan => new CoursePlan({ hostId, spreadsheetId });

    public static for(student: Student) {
        Terse.HtmlService.Element.Progress.setStatus(
            CoursePlan.thread,
            `${student.getFormattedName()} (updating inventory)`
        );
        return CoursePlan.coursePlanInventory.get(student.hostId);
    }

    private static thread = 'course-plan';

    public static setThread(thread: string) {
        CoursePlan.thread = thread;
    }

    private setStatus(message: string) {
        Terse.HtmlService.Element.Progress.setStatus(CoursePlan.thread, message);
    }

    public constructor(arg: Student | { hostId; spreadsheetId }) {
        // TODO deal with GRACE course selection
        if (arg instanceof Student) {
            this.createFromStudent(arg);
        } else {
            this.bindToExistingSpreadsheet(arg);
        }
    }

    private createFromStudent(student: Student) {
        this.setStudent(student);
        this.createFromTemplate();
        this.populateHeaders();
        this.populateEnrollmentHistory();
        this.setPermissions();
        this.prepareCommentBlanks();
        CoursePlan.coursePlanInventory.add([
            student.hostId,
            this.getSpreadsheet().getId(),
            this.getSpreadsheet().getUrl(),
        ]);
    }

    private bindToExistingSpreadsheet({ hostId, spreadsheetId }) {
        // TODO double check that this exists in inventory
        this.setStudent(Student.getByHostId(hostId));
        this.setSpreadsheet(SpreadsheetApp.openById(spreadsheetId));
    }

    private getStudent = () => this.student;

    private setStudent(student: Student) {
        this.setStatus(`${student.getFormattedName()} (identifying student)`);
        this.student = student;
    }

    private getAdvisor() {
        if (!this.advisor && this.student) {
            this.advisor = this.getStudent().getAdvisor();
        }
        return this.advisor;
    }

    public setAdvisor = (advisor: Advisor) => (this.advisor = advisor);

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

    private getValidationSheet() {
        if (!this.validationSheet) {
            this.validationSheet = this.getSpreadsheet().getSheetByName(
                'Courses by Department'
            );
        }
        return this.validationSheet;
    }

    private getNumDepartments = () => this.getValidationSheet().getMaxColumns();

    private populateEnrollmentHistory(create = true) {
        this.setStatus(
            `${this.getStudent().getFormattedName()} (${create ? 'writing' : 'updating'
            } course enrollment history)`
        );

        const values = [];
        const validations = [];

        let rowIncrement = 1;
        let maxYear = CoursePlan.getCurrentSchoolYear();
        if (create) {
            Terse.SpreadsheetApp.DeveloperMetadata.set(
                this.getWorkingCopy(),
                CoursePlan.META_CURRENT_SCHOOL_YEAR,
                CoursePlan.getCurrentSchoolYear()
            );
        } else {
            rowIncrement = Terse.SpreadsheetApp.DeveloperMetadata.get(
                this.getWorkingCopy(),
                CoursePlan.META_NUM_OPTIONS_PER_DEPT
            );
            maxYear = Terse.SpreadsheetApp.DeveloperMetadata.get(
                this.getWorkingCopy(),
                CoursePlan.META_CURRENT_SCHOOL_YEAR
            );
        }

        const numRows = this.getNumDepartments() * rowIncrement;

        for (var row = 0; row < numRows; row += rowIncrement) {
            const rowValue = [];
            const rowValidation = [];
            for (var column = 0; column < 6; column++) {
                const year = this.getAnchorOffset(-1, column).getValue();
                if ((year.substr ? Number(year.substr(0, 4)) : year) < maxYear) {
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

        if (create) {
            this.setStatus(
                `${this.getStudent().getFormattedName()} (moving course plan into place)`
            );
            this.moveToStudentCoursePlanSpreadsheet();

            this.setStatus(
                `${this.getStudent().getFormattedName()} (preparing course selection menus)`
            );
            if (validations[0].length) {
                this.getAnchorOffset(
                    0,
                    historyWidth,
                    validations.length,
                    validations[0].length
                ).setDataValidations(validations);
            }

            this.setStatus(
                `${this.getStudent().getFormattedName()} (protecting data)`
            );
            this.protectNonCommentRanges(historyWidth, historyHeight);

            this.insertAndMergeOptionsRows(values[0].length);
        }
    }

    private static applyFormat = (format, data) =>
        Object.keys(data).reduce(
            (format, key) => format.replaceAll(`{{${key}}}`, data[key]),
            format
        );

    private getFormFolder = () =>
        CoursePlan.formFolderInventory.get(this.getStudent().gradYear);

    public static getFormFolderFor = (student: Student) =>
        CoursePlan.formFolderInventory.get(student.gradYear);

    private getAdvisorFolder = () =>
        CoursePlan.advisorFolderInventory.get(this.getAdvisor().email);

    public static getAdvisorFolderFor = (student: Student) =>
        CoursePlan.advisorFolderInventory.get(student.getAdvisor().email);

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
        this.setStatus(
            `${this.getStudent().getFormattedName()} (creating course plan from template)`
        );
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
        Helper.SpreadsheetApp.addImportrangePermission(
            this.getSpreadsheet(),
            SpreadsheetApp.getActive() // assumes Active() is the data sheet
        );
        this.setWorkingCopy(
            this.getSpreadsheet()
                .getSheetByName(Constants.COURSE_PLAN)
                .copyTo(SpreadsheetApp.getActive()) // assumes Active() is the data sheet
        );
    }

    private populateHeaders() {
        this.setStatus(
            `${this.getStudent().getFormattedName()} (filling in the labels)`
        );
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

    // TODO extract to @battis/gas-lighter
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
        SpreadsheetApp.getActive().deleteSheet(this.getWorkingCopy()); // assumes Active() is the data sheet
        this.setWorkingCopy(plan);
        this.getWorkingCopy().setName(Constants.COURSE_PLAN);
        this.spreadsheet.setActiveSheet(this.getWorkingCopy());
        this.spreadsheet.moveActiveSheet(1);
    }

    private setPermissions() {
        this.setStatus(
            `${this.getStudent().getFormattedName()} (setting permissions)`
        );
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
            Helper.DriveApp.Role.Reader
        );
    }

    private getGRACEEnrollmentsFunction = () =>
        '=' +
        s.IFNA(
            s.JOIN(
                s.CHAR(10),
                s.SORT(
                    s.FILTER(
                        'Enrollment_Title',
                        s.eq('Enrollment_Host_ID', this.getStudent().hostId),
                        s.eq('Enrollment_Department', 'GRACE')
                    )
                )
            ),
            ''
        );

    private getEnrollmentsFunctionBy = (year: string, department: string) =>
        '=' +
        s.IFNA(
            s.JOIN(
                s.CHAR(10),
                s.UNIQUE(
                    s.INDEX(
                        s.SORT(
                            s.FILTER(
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
        );

    public static getCurrentSchoolYear() {
        const now = new Date();
        return now.getMonth() > 6 ? now.getFullYear() + 1 : now.getFullYear();
    }

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
        Terse.SpreadsheetApp.DeveloperMetadata.set(
            this.getWorkingCopy(),
            CoursePlan.META_NUM_OPTIONS_PER_DEPT,
            numOptions
        );
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
            Terse.SpreadsheetApp.Protection.clearEditors(protection);
        }
    }

    private prepareCommentBlanks() {
        this.setStatus(
            `${this.getStudent().getFormattedName()} (making room for comments)`
        );
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
            Terse.SpreadsheetApp.Protection.clearEditors(protection);
            protection.addEditor(commentors[commentor]);
            this.additionalComments(row + 3, numComments);
        }
        Terse.SpreadsheetApp.DeveloperMetadata.set(
            this.getWorkingCopy(),
            CoursePlan.META_NUM_COMMENTS,
            numComments
        );
    }
}
