import lib from '../../lib';
import Base from '../Base';
import Folders from '../Folders';
import Inventory from './Inventory';

class Metadata extends Folders.Metadata {
  public constructor(inventory: Inventory, advisorEmail: Base.Inventory.Key) {
    super(inventory, advisorEmail);
  }

  public get permissionsSet() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.AdvisorFolders.PermissionsSet
    );
  }

  public set permissionsSet(permissionsSet: boolean) {
    this.inventory.setMetadata(
      this.k,
      lib.CoursePlanningData.column.AdvisorFolders.PermissionsSet,
      permissionsSet
    );
  }
}

namespace Metadata { }

export { Metadata as default };
