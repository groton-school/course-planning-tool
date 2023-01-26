import { Helper } from '@battis/google-apps-script-helpers';
import { errorAction } from './Actions/Error';
import Constants from './Constants';
import FolderInventory from './FolderInventory';
import SheetParameters from './SheetParameters';
import State from './State';
import Student from './Student';

const s = Helper.SpreadsheetApp;
const fcn = Helper.SpreadsheetApp.fcn;

class CoursePlan {
    private static formFolderInventory: FolderInventory;
    private static advisorFolderInventory: FolderInventory;

    private static getFormFolder(year) {
        if (!CoursePlan.formFolderInventory) {
            CoursePlan.formFolderInventory = new FolderInventory(
                Constants.Spreadsheet.Sheet.FORM_FOLDER_INVENTORY,
                (year) => `Class of ${year}`
            );
        }
        return CoursePlan.formFolderInventory.getFolder(year);
    }

    private static getAdvisorFolder(hostId) {
        if (!CoursePlan.advisorFolderInventory) {
            CoursePlan.advisorFolderInventory = new FolderInventory(
                Constants.Spreadsheet.Sheet.ADVISOR_FOLDER_INVENTORY,
                (email) => {
                    const [[firstName, lastName]] = State.getDataSheet()
                        .getSheetByName(Constants.Spreadsheet.Sheet.ADVISORS)
                        .createTextFinder(email)
                        .matchEntireCell(true)
                        .findNext()
                        .offset(0, 1, 1, 2)
                        .getDisplayValues();
                    return `${lastName}, ${firstName} - Advisee Course Plans`;
                }
            );
        }
        return CoursePlan.advisorFolderInventory.getFolder(
            CoursePlan.advisorFolderInventory
                .getSheet()
                .createTextFinder(hostId)
                .matchEntireCell(true)
                .findNext()
                .offset(0, 4, 1, 1)
                .getDisplayValue()
        );
    }

    private static setValue(
        sheet: GoogleAppsScript.Spreadsheet.Sheet,
        a1notation: string,
        value
    ) {
        const range = sheet.getRange(a1notation);

        if (Array.isArray(value)) {
            if (!Array.isArray(value[0])) {
                value = [value];
            }
            range.setValues(value);
        } else {
            range.offset(0, 0, 1, 1).setValue(value);
        }
    }

    private static createSheet(student: Student) {
        const spreadsheet = State.getDataSheet();
        var sheet = spreadsheet.setActiveSheet(
            spreadsheet.getSheetByName(Constants.Spreadsheet.Sheet.TEMPLATE)
        );
        sheet = spreadsheet.duplicateActiveSheet();
        sheet.setName(Constants.Spreadsheet.Sheet.COURSE_PLAN);
        return sheet;
    }

    private static updateHeaders(sheet, student: Student) {
        CoursePlan.setValue(sheet, Constants.Spreadsheet.A1Notation.NAMES, [
            [student.getFormattedName()],
            [
                '="Advisor: "&' +
                fcn(
                    s.JOIN,
                    '" "',
                    fcn(
                        s.INDEX,
                        `'${Constants.Spreadsheet.Sheet.ADVISORS}'!G:H`,
                        s.fcn(
                            s.MATCH,
                            `"${student.hostId}"`,
                            `'${Constants.Spreadsheet.Sheet.ADVISORS}'!A:A`,
                            0
                        ),
                        0
                    )
                ),
            ],
        ]);
        const years: (string | number)[] = [4, 3, 2, 1, 0].map(
            (value) => `${student.gradYear - value - 1} - ${student.gradYear - value}`
        );
        years.splice(2, 0, student.gradYear - 3);
        CoursePlan.setValue(sheet, Constants.Spreadsheet.A1Notation.YEARS, years);
    }

    private static replaceWithDisplayValues(
        sheet: GoogleAppsScript.Spreadsheet.Sheet
    ) {
        const range = sheet.getRange(
            1,
            1,
            sheet.getMaxRows(),
            sheet.getMaxColumns()
        );
        const display = range.getDisplayValues();
        range.setValues(display);
    }

    private static createSpreadsheet(
        student: Student,
        sheet: GoogleAppsScript.Spreadsheet.Sheet
    ) {
        const spreadsheet = SpreadsheetApp.create(
            `Course Plan for ${student.getFormattedName()}`
        );
        sheet.copyTo(spreadsheet).setName(Constants.Spreadsheet.Sheet.COURSE_PLAN);
        sheet.getParent().deleteSheet(sheet);
        spreadsheet.getSheets().forEach((sheet) => {
            if (sheet.getName() != Constants.Spreadsheet.Sheet.COURSE_PLAN) {
                spreadsheet.deleteSheet(sheet);
            }
        });
        // TODO make sure course list validation transfers to new spreadsheet
        // TODO add access privileges

        // FIXME file is getting neither moved nor shortcutted
        const file = DriveApp.getFileById(spreadsheet.getId());
        file.moveTo(CoursePlan.getFormFolder(student.gradYear));
        CoursePlan.getAdvisorFolder(student).createShortcut(file.getId());
        return spreadsheet;
    }

    private static getGraceEnrollments(student: Student): string {
        return (
            '=' +
            s.fcn(
                s.IFNA,
                s.fcn(
                    s.JOIN,
                    s.fcn(s.CHAR, 10),
                    s.fcn(
                        s.SORT,
                        s.fcn(
                            s.FILTER,
                            Constants.Spreadsheet.Range.TITLE,
                            s.eq(Constants.Spreadsheet.Range.HOST_ID, student.hostId),
                            s.eq(Constants.Spreadsheet.Range.DEPT, Constants.GRACE)
                        )
                    )
                ),
                ''
            )
        );
    }

    private static getDepartmentalEnrollments(
        student: Student,
        year: string,
        department: string
    ): string {
        return (
            '=' +
            s.fcn(
                s.IFNA,
                s.fcn(
                    s.JOIN,
                    s.fcn(s.CHAR, 10),
                    s.fcn(
                        s.UNIQUE,
                        s.fcn(
                            s.INDEX,
                            s.fcn(
                                s.SORT,
                                s.fcn(
                                    s.FILTER,
                                    `{${Constants.Spreadsheet.Range.TITLE}, ${Constants.Spreadsheet.Range.ORDER}}`,
                                    s.eq(Constants.Spreadsheet.Range.HOST_ID, student.hostId),
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

    public static createCoursePlan(student: Student) {
        const sheet = CoursePlan.createSheet(student);
        CoursePlan.updateHeaders(sheet, student);

        const topLeft = sheet.getRange(
            Constants.Spreadsheet.A1Notation.ENROLLMENT_TOP_LEFT
        );
        const validation = sheet
            .getParent()
            .getSheetByName(Constants.Spreadsheet.Sheet.DEPTS);
        const numDepartments = validation.getMaxColumns();
        const now = new Date();
        const schoolYear =
            now.getMonth() > 6 ? now.getFullYear() + 1 : now.getFullYear();
        const values = [];
        const validations = [];
        for (var row = 0; row < numDepartments; row++) {
            const rowValue = [];
            const rowValidation = [];
            for (var column = 0; column < 6; column++) {
                const year = topLeft.offset(-1, column).getValue();
                if ((year.substr ? Number(year.substr(0, 4)) : year) < schoolYear) {
                    if (topLeft.offset(-2, column).getValue() == Constants.GRACE) {
                        if (row == numDepartments - 1) {
                            rowValue.push(CoursePlan.getGraceEnrollments(student));
                        } else {
                            rowValue.push('');
                        }
                    } else {
                        const department = topLeft.offset(row, -1).getValue();
                        rowValue.push(
                            CoursePlan.getDepartmentalEnrollments(student, year, department)
                        );
                    }
                } else {
                    rowValidation.push(
                        SpreadsheetApp.newDataValidation()
                            .requireValueInRange(validation.getRange('A2:A').offset(0, row))
                            .build()
                    );
                }
            }
            values.push(rowValue);
            validations.push(rowValidation);
        }
        topLeft.offset(0, 0, values.length, values[0].length).setValues(values);
        if (validations[0].length) {
            topLeft
                .offset(0, values[0].length, validations.length, validations[0].length)
                .setDataValidations(validations);
        }

        CoursePlan.replaceWithDisplayValues(sheet);

        const numOptions = SheetParameters.getParam(
            SheetParameters.NUM_OPTIONS_PER_DEPT
        );
        for (var row = 0; row < numDepartments * numOptions; row += numOptions) {
            sheet.insertRowsAfter(topLeft.getRow() + row, numOptions - 1);
            topLeft
                .offset(row, -1, numOptions, values[0].length + 1)
                .mergeVertically();
        }

        // TODO deal with GRACE course selection
        // TODO add advisor notes (protected)
        // TODO add studies committee notes (protected)
        // TODO add college counseling notes (protected)

        return CoursePlan.createSpreadsheet(student, sheet);
    }

    public static createCoursePlanMockup(student?) {
        student && State.setStudent(student);
        student = State.getStudent();
        CoursePlan.createCoursePlan(student);
        return errorAction(
            `${student.getFormattedName()}`,
            `A course plan for ${student.getFormattedName()} has been created in the "Mockup" sheet.`
        );
    }

    public static createAll() { }
}

global.action_coursePlan_mockup = CoursePlan.createCoursePlanMockup;
export const Mockup = 'action_coursePlan_mockup';

global.action_coursePlan_createAll = CoursePlan.createAll;
export const CreateAll = 'action_coursePlan_createAll';
