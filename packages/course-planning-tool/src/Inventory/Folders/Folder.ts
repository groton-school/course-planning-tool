import g from '@battis/gas-lighter';
import Base from '../Base';
import Inventory from './Inventory';
import Metadata from './Metadata';

class Folder
  extends Base.Item
  implements g.HtmlService.Element.Picker.Pickable {
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
    return this.driveFolder.getUrl();
  }

  private _driveFolder?: GoogleAppsScript.Drive.Folder;
  public get driveFolder() {
    if (!this._driveFolder) {
      this._driveFolder = DriveApp.getFolderById(this.id);
    }
    return this._driveFolder;
  }

  public meta = new Metadata(this.inventory as Inventory, this.key);

  public toOption(): g.HtmlService.Element.Picker.Option {
    return { name: this.id, value: this.key.toString() };
  }
}

namespace Folder {
  export function isFolder(obj: any): obj is Folder {
    return Base.Item.isItem(obj) && 'folder' in obj;
  }
}

export { Folder as default };
