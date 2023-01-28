import Constants from './Constants';
import CoursePlan from './CoursePlan';
import State from './State';
import Student from './Student';

type Formatter = (key: string) => string;

export default class Inventory {
    private inventorySheet: GoogleAppsScript.Spreadsheet.Sheet;
    private formatter?: Formatter;

    constructor(sheetName: string, formatter?: Formatter) {
        this.inventorySheet = State.getDataSheet().getSheetByName(sheetName);
        this.formatter = formatter;
    }

    private getData() {
        return this.inventorySheet
            .getRange(
                1,
                1,
                this.inventorySheet.getMaxRows(),
                this.inventorySheet.getMaxColumns()
            )
            .getValues();
    }

    private getItem(getter: Function, creator: Function, key) {
        const id = this.getData().reduce((id: string, [k, i, u]) => {
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

    public getFolder = this.getItem.bind(
        this,
        DriveApp.getFolderById,
        this.createFolder
    );

    public getCoursePlan(student: Student) {
        return this.getItem(
            SpreadsheetApp.openById,
            this.createCoursePlan.bind(this, student),
            student.hostId
        );
    }

    public getRootFolder() {
        return this.getFolder(Constants.FolderInventory.ROOT);
    }

    private createFolder(key): GoogleAppsScript.Drive.Folder {
        const folderName = (this.formatter && this.formatter(key)) || key;
        const folder = this.getRootFolder().createFolder(folderName);
        const row = [key, folder.getId(), folder.getUrl()];
        this.inventorySheet.appendRow(row);
        return folder;
    }

    private createCoursePlan(student: Student, key): CoursePlan {
        const plan = new CoursePlan(student);
        const row = [key, plan.getFile().getId(), plan.getFile().getUrl()];
        this.inventorySheet.appendRow(row);
        return plan;
    }

    public getSheet() {
        return this.inventorySheet;
    }
}
