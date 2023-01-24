import { Helper, Terse } from '@battis/google-apps-script-helpers';
import { errorCard } from './Actions/App/Error';
import { SHEET_ADVISORS } from './Constants';
import SheetParameters from './SheetParameters';
import State from './State';
import Student from './Student';

const s = Helper.SpreadsheetApp;
const fcn = Helper.SpreadsheetApp.fcn;

class CoursePlan {
    private static readonly RANGE_HOST_ID = 'Enrollment_Host_ID';
    private static readonly RANGE_TITLE = 'Enrollment_Title';
    private static readonly RANGE_ORDER = 'Enrollment_Order';
    private static readonly RANGE_DEPT = 'Enrollment_Department';
    private static readonly RANGE_YEAR = 'Enrollment_Year';

    private static readonly A1_NAMES = 'A1:A2';
    private static readonly A1_YEARS = 'B5:G5';
    private static readonly A1_ENROLLMENT_TOP_LEFT = 'B6';

    private static readonly SHEET_DEPTS = 'Courses by Department';
    private static readonly SHEET_TEMPLATE = 'Template';
    private static readonly SHEET_MOCKUP = 'Mockup';

    private static readonly GRACE = 'GRACE';

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

    private static createSheet() {
        const spreadsheet = SpreadsheetApp.getActive();
        const mockup = spreadsheet.getSheetByName(CoursePlan.SHEET_MOCKUP);
        if (mockup) {
            spreadsheet.deleteSheet(mockup);
        }
        var sheet = spreadsheet.setActiveSheet(
            spreadsheet.getSheetByName(CoursePlan.SHEET_TEMPLATE)
        );
        sheet = spreadsheet.duplicateActiveSheet();
        sheet.setName(CoursePlan.SHEET_MOCKUP);
        return sheet;
    }

    private static updateHeaders(sheet, student: Student) {
        CoursePlan.setValue(sheet, CoursePlan.A1_NAMES, [
            [student.getFormattedName()],
            [
                '="Advisor: "&' +
                fcn(
                    s.JOIN,
                    '" "',
                    fcn(
                        s.INDEX,
                        `'${SHEET_ADVISORS}'!G:H`,
                        s.fcn(
                            s.MATCH,
                            `"${student.hostId}"`,
                            `'${SHEET_ADVISORS}'!A:A`,
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
        CoursePlan.setValue(sheet, CoursePlan.A1_YEARS, years);
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

    public static createCoursePlan(): GoogleAppsScript.Card_Service.ActionResponse {
        const student = State.getStudent();

        const sheet = CoursePlan.createSheet();
        CoursePlan.updateHeaders(sheet, student);

        const topLeft = sheet.getRange(CoursePlan.A1_ENROLLMENT_TOP_LEFT);
        const validation = sheet.getParent().getSheetByName(CoursePlan.SHEET_DEPTS);
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
                    if (topLeft.offset(-2, column).getValue() == CoursePlan.GRACE) {
                        if (row == numDepartments - 1) {
                            rowValue.push(
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
                                                CoursePlan.RANGE_TITLE,
                                                s.eq(CoursePlan.RANGE_HOST_ID, student.hostId),
                                                s.eq(CoursePlan.RANGE_DEPT, CoursePlan.GRACE)
                                            )
                                        )
                                    ),
                                    ''
                                )
                            );
                        } else {
                            rowValue.push('');
                        }
                    } else {
                        const department = topLeft.offset(row, -1).getValue();
                        rowValue.push(
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
                                                    `{${CoursePlan.RANGE_TITLE}, ${CoursePlan.RANGE_ORDER}}`,
                                                    s.eq(CoursePlan.RANGE_HOST_ID, student.hostId),
                                                    s.eq(CoursePlan.RANGE_YEAR, year),
                                                    s.eq(CoursePlan.RANGE_DEPT, department)
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
        /*
         * TODO create individual student spreadsheets
         *   Create in form-level folders (updating Form Folder Inventory) and add their ID and URL as columns on the Advisor List, update student access permissions
         */
        /*
         * TODO alias student spreadsheets to advisor folders
         *   Create advisor folders as needed and update Advisor Folder Inventory, update advisor access permissions
         */

        return Terse.CardService.replaceStack(
            errorCard(
                `Mocked up ${student.getFormattedName()}`,
                JSON.stringify(student, null, 2)
            )
        );
    }
}

global.action_coursePlan_mockup = CoursePlan.createCoursePlan;
export default 'action_coursePlan_mockup';
