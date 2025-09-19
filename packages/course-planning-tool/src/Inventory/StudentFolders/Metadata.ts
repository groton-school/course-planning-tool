import lib from '../../lib';
import Base from '../Base';
import Folders from '../Folders';
import Inventory from './Inventory';

class Metadata extends Folders.Metadata {
  public constructor(inventory: Inventory, hostId: Base.Inventory.Key) {
    super(inventory, hostId);
  }

  public get inactive() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.StudentFolders.Inactive
    );
  }
  public get active() {
    return !this.inactive;
  }
  public get newAdvisor() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.StudentFolders.NewAdvisor
    );
  }
}

namespace Metadata { }

export { Metadata as default };
