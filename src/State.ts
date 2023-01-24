import { Terse } from '@battis/google-apps-script-helpers';
import { PREFIX } from './Constants';

export default class State {
    private static readonly DATA_SHEET = `${PREFIX}.data`;

    private static dataSheet;

    public static getDataSheet() {
        if (!this.dataSheet) {
            const id = Terse.PropertiesService.getUserProperty(this.DATA_SHEET);
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
            Terse.PropertiesService.deleteUserProperty(this.DATA_SHEET);
        }
    }
}
