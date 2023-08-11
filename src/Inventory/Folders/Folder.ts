import Base from '../Base';
import Inventory from './Inventory';
import Metadata from './Metadata';

class Folder extends Base.Item {
  public constructor(
    inventory: Inventory,
    folder: GoogleAppsScript.Drive.Folder,
    key: Base.Inventory.Key
  ) {
    super(inventory, folder, key);
  }

  public get folder(): GoogleAppsScript.Drive.Folder {
    return this._content;
  }

  public meta = new Metadata(this.inventory as Inventory, this.key);
}

namespace Folder {
  export function isFolder(obj: any): obj is Folder {
    return Base.Item.isItem(obj) && 'folder' in obj;
  }
}

export { Folder as default };
