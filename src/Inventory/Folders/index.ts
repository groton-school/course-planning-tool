import MFolder from './Folder';
import Inventory from './Inventory';
import MMetadata from './Metadata';

class Folders<
  FolderType extends Folders.Folder = Folders.Folder
> extends Inventory<FolderType> { }

namespace Folders {
  export import Folder = MFolder;
  export import Metadata = MMetadata;
}

export { Folders as default };
