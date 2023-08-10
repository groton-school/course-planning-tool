import Base from '../Base';
import Folders from '../Folders';
import Inventory from './Inventory';

class Metadata extends Folders.Metadata {
  public constructor(inventory: Inventory, advisorEmail: Base.Inventory.Key) {
    super(inventory, advisorEmail);
  }

  public get permissionsSet() {
    return this.inventory.getMetadata(this.k, 6);
  }

  public set permissionsSet(permissionsSet: boolean) {
    this.inventory.setMetadata(this.k, 6, permissionsSet);
  }
}

namespace Metadata { }

export { Metadata as default };
