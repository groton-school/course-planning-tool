import Base from '../Base';
import Folders from '../Folders';
import Inventory from './Inventory';

class Metadata extends Folders.Metadata {
  public constructor(inventory: Inventory, hostId: Base.Inventory.Key) {
    super(inventory, hostId);
  }

  public get inactive() {
    return this.inventory.getMetadata(this.k, 7);
  }
  public get newAdvisor() {
    return this.inventory.getMetadata(this.k, 8);
  }
  public get permissionsUpdated() {
    return this.inventory.getMetadata(this.k, 9);
  }
  public set permissionsUpdated(permissionsUpdated: boolean) {
    this.inventory.setMetadata(this.k, 9, permissionsUpdated);
  }
}

namespace Metadata { }

export { Metadata as default };
