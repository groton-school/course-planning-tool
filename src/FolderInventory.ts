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
        const debug = { key };
        var folder = DriveApp.getFolderById(
            this.inventorySheet
                .createTextFinder(key)
                .matchEntireCell(true)
                .findNext()
                .offset(0, 1, 1, 1)
                .getDisplayValue()
        );
        debug['initialFolder'] = folder && {
            id: folder.getId(),
            name: folder.getName(),
        };
        if (!folder) {
            folder = this.createFolder(key);
            debug['createFolder'] = folder && {
                id: folder.getId(),
                name: folder.getName(),
            };
        }
        SpreadsheetApp.getUi().showModalDialog(
            HtmlService.createHtmlOutput(`<pre>${JSON.stringify(debug)}</pre>`),
            'Debugging'
        );
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

    public getSheet() {
        return this.inventorySheet;
    }
}
