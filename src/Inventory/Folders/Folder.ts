import Base from '../Base';
import Inventory from './Inventory';
import Metadata from './Metadata';

class Folder extends Base.Item {
  public constructor(
    inventory: Inventory,
    folderId: string,
    key: Base.Inventory.Key
  ) {
    super(inventory, folderId, key);
    if (!this.inventory || !this._id || !this._key) {
      throw new Error(
        `Required constructor args not present ${JSON.stringify({
          inventory: inventory ? typeof inventory : inventory,
          folderId,
          key
        })}`
      );
    }
  }

  public get url() {
    return this.folder.getUrl();
  }

  private _folder?: GoogleAppsScript.Drive.Folder;
  public get folder() {
    if (!this._folder) {
      this._folder = DriveApp.getFolderById(this.id);
    }
    return this._folder;
  }

  public meta = new Metadata(this.inventory as Inventory, this.key);
}

namespace Folder {
  export function isFolder(obj: any): obj is Folder {
    return Base.Item.isItem(obj) && 'folder' in obj;
  }
}

export { Folder as default };
