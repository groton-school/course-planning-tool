import Constants from './Constants';
import CoursePlan from './CoursePlan';
import State from './State';
import Student from './Student';

type Key = number | string;
type Formatter = (key: Key) => string;
type Getter<T> = (id: string) => T;
type Creator<T> = (key: Key) => T;

export default class Inventory {
    private inventorySheet: GoogleAppsScript.Spreadsheet.Sheet;
    private formatter?: Formatter;

    constructor(sheetName: string, formatter?: Formatter) {
        this.inventorySheet = State.getDataSheet().getSheetByName(sheetName);
        this.formatter = formatter;
    }

    private getData() {
        // TODO reasonably, caching this should improve performance, no?
        return this.inventorySheet
            .getRange(
                1,
                1,
                this.inventorySheet.getMaxRows(),
                this.inventorySheet.getMaxColumns()
            )
            .getValues();
    }

    private getItem<T>(getter: Getter<T>, creator: Creator<T>, key: Key) {
        const id = this.getData().reduce((id: string, [k, i]) => {
            if (k == key) {
                return i;
            }
            return id;
        }, null);
        if (!id) {
            return creator(key);
        }
        return getter(id);
    }

    public getFolder(key: Key) {
        const self = this;
        return this.getItem(
            DriveApp.getFolderById,
            this.createFolder.bind(self),
            key
        );
    }

    public getCoursePlan(student: Student) {
        const self = this;
        return this.getItem(
            SpreadsheetApp.openById,
            this.createCoursePlan.bind(self, student),
            student.hostId
        );
    }

    public getRootFolder() {
        return this.getFolder(Constants.Inventory.ROOT);
    }

    private createFolder(key: Key): GoogleAppsScript.Drive.Folder {
        const folderName =
            (this.formatter && this.formatter(key)) || key.toString();
        const folder = this.getRootFolder().createFolder(folderName);
        const row = [key, folder.getId(), folder.getUrl()];
        this.inventorySheet.appendRow(row);
        // TODO add advisor as viewer to newly created advisory folder
        return folder;
    }

    private createCoursePlan(
        student: Student,
        key: Key
    ): GoogleAppsScript.Spreadsheet.Spreadsheet {
        const plan = new CoursePlan(student);
        const row = [key, plan.getFile().getId(), plan.getFile().getUrl()];
        this.inventorySheet.appendRow(row);
        return plan.getSpreadsheet();
    }

    public getSheet() {
        return this.inventorySheet;
    }
}
