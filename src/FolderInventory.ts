import Constants from './Constants';
import State from './State';

type Formatter = (string) => string;

export default class FolderInventory {
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

    public getFolder(key): GoogleAppsScript.Drive.Folder {
        const id = this.getData().reduce((id: string, [k, i, u]) => {
            if (k == key) {
                return i;
            }
            return id;
        }, null);
        if (!id) {
            return this.createFolder(key);
        }
        return DriveApp.getFolderById(id);
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

    public getSheet() {
        return this.inventorySheet;
    }
}
