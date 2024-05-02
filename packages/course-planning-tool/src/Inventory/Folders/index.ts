import MFolder from './Folder';
import MInventory from './Inventory';
import MMetadata from './Metadata';

namespace Folders {
  export import Inventory = MInventory;
  export import Folder = MFolder;
  export import Metadata = MMetadata;
}

export { Folders as default };
