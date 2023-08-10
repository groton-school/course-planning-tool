import Inventory from './Inventory';
import Metadata from './Metadata';

const itemKind = 'kind#Inventory.Item';

class Item {
  public readonly kind = itemKind;

  public constructor(
    protected _inventory: Inventory,
    protected _content: any,
    protected _key: Inventory.Key
  ) { }

  public meta = new Metadata(this._inventory, this._key);

  public get inventory() {
    return this._inventory;
  }
  public get content() {
    return this._content;
  }
  public get key() {
    return this._key;
  }
}
namespace Item {
  export function isItem<WrappedType = any>(obj: any): obj is Item {
    return (
      obj && typeof obj === 'object' && 'kind' in obj && obj.kind === itemKind
    );
  }
}

export { Item as default };
