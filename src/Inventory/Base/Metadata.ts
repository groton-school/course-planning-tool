import lib from '../../lib';
import Inventory from './Inventory';

class Metadata {
  public constructor(
    protected inventory: Inventory,
    protected k: Inventory.Key
  ) { }

  public get key() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.Inventory.Key
    );
  }

  public get id() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.Inventory.Id
    );
  }

  public get url() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.Inventory.Url
    );
  }
}

namespace Metadata { }

export { Metadata as default };
