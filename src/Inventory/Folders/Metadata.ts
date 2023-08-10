import Base from '../Base';
import Inventory from './Inventory';

class Metadata extends Base.Metadata {
  public constructor(inventory: Inventory, key: Base.Inventory.Key) {
    super(inventory, key);
  }

  public get folderId() {
    return this.id;
  }
  public get folderUrl() {
    return this.url;
  }
}

namespace Metadata { }

export { Metadata as default };
