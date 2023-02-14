import CoursePlan from './CoursePlan';
import * as State from './State';
import Student from './Student';

export type Key = number | string;
type Formatter = (key: Key) => string;
type Getter<T> = (id: string, key?: Key) => T;
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
        try {
            return getter(id, key);
        } catch (e) {
            return getter(id); // not everyone _wants_ the key!
        }
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
            CoursePlan.bindTo,
            this.createCoursePlan.bind(self, student),
            student.hostId
        );
    }

    public getRootFolder() {
        return this.getFolder('ROOT');
    }

    private createFolder(key: Key): GoogleAppsScript.Drive.Folder {
        const folderName =
            (this.formatter && this.formatter(key)) || key.toString();
        const folder = this.getRootFolder().createFolder(folderName);
        const row = [key, folder.getId(), folder.getUrl()];
        this.inventorySheet.appendRow(row);
        return folder;
    }

    private createCoursePlan(student: Student, key: Key): CoursePlan {
        const plan = new CoursePlan(student);
        const row = [key, plan.getFile().getId(), plan.getFile().getUrl()];
        this.inventorySheet.appendRow(row);
        return plan;
    }

    public getSheet() {
        return this.inventorySheet;
    }
}
