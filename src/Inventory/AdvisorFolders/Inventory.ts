import Base from '../Base';
import Folders from '../Folders';
import AdvisorFolder from './AdvisorFolder';

class Inventory extends Folders<AdvisorFolder> {
  protected creator(key: Base.Inventory.Key): AdvisorFolder {
    const folder = this.root.folder.createFolder(this.formatter(key));
    this.add([key, folder.getId(), folder.getUrl()]);
    return new AdvisorFolder(this, folder, key);
  }
}

namespace Inventory { }

export { Inventory as default };
