import Inventory, { Formatter, Key } from './Inventory';

export default class FolderInventory extends Inventory<GoogleAppsScript.Drive.Folder> {
    public static COL_FOLDER_ID = Inventory.COL_ID;
    public static COL_FOLDER_URL = Inventory.COL_URL;

    public constructor(sheetName: string, formatter: Formatter) {
        super(sheetName);
        this.formatter = formatter;
    }

    public getRoot = this.get.bind(this, 'ROOT');

    protected formatter = (key: Key) => key.toString();

    protected getter = (id: string, key?: Key): GoogleAppsScript.Drive.Folder =>
        DriveApp.getFolderById(id);

    protected creator(key: Key): GoogleAppsScript.Drive.Folder {
        const folder = this.getRoot().createFolder(this.formatter(key));
        this.add([key, folder.getId(), folder.getUrl()]);
        return folder;
    }
}
