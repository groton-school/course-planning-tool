import Base from '../Base';
import Folders from '../Folders';
import Metadata from './/Metadata';
import Inventory from './Inventory';

class AdvisorFolder extends Folders.Folder {
  public constructor(
    inventory: Inventory,
    advisorFolder: GoogleAppsScript.Drive.Folder,
    advisorEmail: Base.Inventory.Key
  ) {
    super(inventory, advisorFolder, advisorEmail);
  }

  public meta = new Metadata(this.inventory as Inventory, this.key);

  public get advisorFolder() {
    return this.folder;
  }
}

namespace AdvisorFolder { }

export { AdvisorFolder as default };
