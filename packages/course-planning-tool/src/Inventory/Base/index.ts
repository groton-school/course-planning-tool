import MInventory from './Inventory';
import MItem from './Item';
import MMetadata from './Metadata';

class Base {
  private constructor() { }
}

namespace Base {
  export import Inventory = MInventory;
  export import Item = MItem;
  export import Metadata = MMetadata;
}

export { Base as default };
