import State from './State';

enum Col {
    Key = 0,
    FolderID = 1,
    FolderURL = 2,
}

type Formatter = (string) => string;

export default class FolderInventory {
    private inventorySheet: GoogleAppsScript.Spreadsheet.Sheet;
    private formatter?: Formatter;

    constructor(sheetName: string, formatter?: Formatter) {
        this.inventorySheet = State.getDataSheet().getSheetByName(sheetName);
        this.formatter = formatter;
    }

    getFolder(key): GoogleAppsScript.Drive.Folder {
        var folder = this.inventorySheet
            .getSheetValues(
                2,
                1,
                this.inventorySheet.getMaxRows() - 1,
                this.inventorySheet.getMaxColumns()
            )
            .reduce((folder: GoogleAppsScript.Drive.Folder, row) => {
                if (row[Col.Key] == key) {
                    return DriveApp.getFolderById(row[Col.FolderID]);
                }
            }, null);
        if (!folder) {
            return this.createFolder(key);
        }
        return folder;
    }

    public getRootFolder() {
        return this.getFolder('ROOT');
    }

    private createFolder(key): GoogleAppsScript.Drive.Folder {
        const folderName = (this.formatter && this.formatter(key)) || key;
        const folder = this.getRootFolder().createFolder(folderName);
        const row = [];
        row[Col.Key] = key;
        row[Col.FolderID] = folder.getId();
        row[Col.FolderURL] = folder.getUrl();
        this.inventorySheet.appendRow(row);
        return folder;
    }
}
