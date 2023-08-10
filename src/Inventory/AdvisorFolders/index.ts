import MAdvisorFolder from './AdvisorFolder';
import Inventory from './Inventory';
import MMetadata from './Metadata';

class AdvisorFolders extends Inventory { }

namespace AdvisorFolders {
  export import AdvisorFolder = MAdvisorFolder;
  export import Metadata = MMetadata;
}

export { AdvisorFolders as default };
