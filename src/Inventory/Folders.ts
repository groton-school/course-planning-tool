import Inventory from './Inventory';

class Folders extends Inventory<GoogleAppsScript.Drive.Folder> {
  public Cols = {
    ...super.Cols,
    FolderId: super.Cols.Id,
    FolderUrl: super.Cols.Url
  };

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
}

namespace Folders { }

export { Folders as default };
