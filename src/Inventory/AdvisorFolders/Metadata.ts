import lib from '../../lib';
import Base from '../Base';
import Folders from '../Folders';
import Inventory from './Inventory';

class Metadata extends Folders.Metadata {
  public constructor(inventory: Inventory, advisorEmail: Base.Inventory.Key) {
    super(inventory, advisorEmail);
  }

  public get inactive() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.AdvisorFolders.Inactive
    );
  }
  public get active() {
    return !this.inactive;
  }
}

namespace Metadata { }

export { Metadata as default };
