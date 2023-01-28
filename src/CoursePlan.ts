import s from '@battis/google-apps-script-helpers/src/Helper/SpreadsheetApp';
import Advisor from './Advisor';
import Constants from './Constants';
import FolderInventory from './FolderInventory';
import SheetParameters from './SheetParameters';
import State from './State';
import Student from './Student';

class CoursePlan {
    private static formFolderInventory: FolderInventory;
    private static advisorFolderInventory: FolderInventory;

    private student: Student;
    private advisor: Advisor;
    private spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
    private file: GoogleAppsScript.Drive.File;
    private workingCopy?: GoogleAppsScript.Spreadsheet.Sheet;
    private enrollmentTopLeft?: GoogleAppsScript.Spreadsheet.Range;
    private validationSheet?: GoogleAppsScript.Spreadsheet.Sheet;

    public constructor(student: Student) {
        this.setStudent(student);
        this.createFromTemplate();
        this.populateHeaders();
        this.populateEnrollmentHistory();

        // TODO deal with GRACE course selection
        // TODO add advisor notes (protected)
        // TODO add studies committee notes (protected)
        // TODO add college counseling notes (protected)
        // TODO honor number of comment blanks param

        this.setPermissions();
    }

    public static createMockup(student?: Student | string) {
        student && State.setStudent(student);
        student = State.getStudent();
        const plan = new CoursePlan(student);
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

    private getSpreadsheet() {
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
                    this.getSchoolYear()
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

    private applyFormat(format, data) {
        return Object.keys(data).reduce(
            (format, key) => format.replaceAll(`{{${key}}}`, data[key]),
            format
        );
    }

    private getFormFolder() {
        const self = this;
        if (!CoursePlan.formFolderInventory) {
            CoursePlan.formFolderInventory = new FolderInventory(
                Constants.Spreadsheet.Sheet.FORM_FOLDER_INVENTORY,
                (gradYear) =>
                    self.applyFormat(SheetParameters.getFormFolderNameFormat(), {
                        gradYear,
                    })
            );
        }
        return CoursePlan.formFolderInventory.getFolder(this.getStudent().gradYear);
    }

    private getAdvisorFolder() {
        if (!CoursePlan.advisorFolderInventory) {
            const self = this;
            CoursePlan.advisorFolderInventory = new FolderInventory(
                Constants.Spreadsheet.Sheet.ADVISOR_FOLDER_INVENTORY,
                (email) =>
                    self.applyFormat(
                        SheetParameters.getAdvisorFolderNameFormat(),
                        Advisor.getByEmail(email)
                    )
            );
        }
        return CoursePlan.advisorFolderInventory.getFolder(this.getAdvisor().email);
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
        // TODO log link to plan in data sheet
        const template = State.getTemplate();
        this.setSpreadsheet(
            template.copy(
                this.applyFormat(
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
        // TODO add access privileges
        this.getFile().moveTo(this.getFormFolder());
        this.getAdvisorFolder().createShortcut(this.getFile().getId());
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

    private getSchoolYear() {
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
}

global.action_coursePlan_mockup = CoursePlan.createMockup;
export const Mockup = 'action_coursePlan_mockup';
