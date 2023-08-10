import Inventory from './Inventory';

class Metadata {
  public constructor(
    protected inventory: Inventory,
    protected k: Inventory.Key
  ) { }

  public get key() {
    return this.inventory.getMetadata(this.k, 1);
  }

  public get id() {
    return this.inventory.getMetadata(this.k, 2);
  }

  public get url() {
    return this.inventory.getMetadata(this.k, 3);
  }
}

namespace Metadata { }

export { Metadata as default };
