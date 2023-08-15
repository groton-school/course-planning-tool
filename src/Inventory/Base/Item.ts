import Inventory from './Inventory';
import Metadata from './Metadata';

const itemKind = 'kind#Inventory.Item';

class Item {
  public readonly kind = itemKind;

  public constructor(
    protected _inventory: Inventory,
    protected _id: any,
    protected _key: Inventory.Key
  ) { }

  public meta = new Metadata(this._inventory, this._key);

  public get inventory() {
    return this._inventory;
  }

  public get id() {
    return this._id;
  }

  public get key() {
    return this._key;
  }
}

namespace Item {
  export function isItem(obj: any): obj is Item {
    return (
      obj && typeof obj === 'object' && 'kind' in obj && obj.kind === itemKind
    );
  }
}

export { Item as default };
