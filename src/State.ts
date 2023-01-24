import { Terse } from '@battis/google-apps-script-helpers';
import { PREFIX } from './Constants';
import Student from './Student';

export default class State {
    private static readonly DATA_SHEET = `${PREFIX}.data`;
    private static readonly STUDENT = `${PREFIX}.student`;

    private static dataSheet;

    public static getDataSheet() {
        if (!this.dataSheet) {
            const id = Terse.PropertiesService.getUserProperty(State.DATA_SHEET);
            if (id) {
                this.dataSheet = SpreadsheetApp.openById(id);
            }
            if (!this.dataSheet) {
                this.setDataSheet(SpreadsheetApp.getActive());
            }
        }
        return this.dataSheet;
    }

    public static setDataSheet(
        spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet
    ) {
        this.dataSheet = spreadsheet;
        if (this.dataSheet) {
            Terse.PropertiesService.setUserProperty(
                this.DATA_SHEET,
                this.dataSheet.getId()
            );
        } else {
            Terse.PropertiesService.deleteUserProperty(State.DATA_SHEET);
        }
    }

    public static getStudent() {
        return new Student(
            JSON.parse(Terse.PropertiesService.getUserProperty(State.STUDENT))
        );
    }

    public static setStudent(student: Student | string) {
        Terse.PropertiesService.setUserProperty(
            this.STUDENT,
            student instanceof Student ? JSON.stringify(student) : student
        );
    }

    public static resetStudent() {
        Terse.PropertiesService.deleteUserProperty(State.STUDENT);
    }

    public static toJSON() {
        return JSON.stringify(
            { student: State.getStudent(), dataSheet: State.getDataSheet().getId() },
            null,
            2
        );
    }
}
