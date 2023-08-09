import Inventory from './Inventory';

class Folders extends Inventory<GoogleAppsScript.Drive.Folder> {
  public constructor(sheetName: string, formatter: Inventory.Formatter) {
    super(sheetName);
    this.formatter = formatter;
  }

  public getRoot = this.get.bind(this, 'ROOT');

  protected formatter = (key: Inventory.Key) => key.toString();

  protected getter = (
    id: string,
    key?: Inventory.Key
  ): GoogleAppsScript.Drive.Folder => DriveApp.getFolderById(id);

  protected creator(key: Inventory.Key): GoogleAppsScript.Drive.Folder {
    const folder = this.getRoot().createFolder(this.formatter(key));
    this.add([key, folder.getId(), folder.getUrl()]);
    return folder;
  }

  public getFolderId = (key: Inventory.Key) => this.getMetadata(key, 2);
  public getFolderUrl = (key: Inventory.Key) => this.getMetadata(key, 3);
}

namespace Folders {
  /*  export enum Cols {
    Key = 1,
    Id = 2,
    Url = 3,
    FolderId = 2,
    FolderUrl = 3
  } */
  export type Key = Inventory.Key;
}

export { Folders as default };
