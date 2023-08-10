import Base from '../Base';
import Folders from '../Folders';
import Inventory from './Inventory';
import Metadata from './Metadata';

class StudentFolder extends Folders.Folder {
  public constructor(
    inventory: Inventory,
    studentFolder: GoogleAppsScript.Drive.Folder,
    hostId: Base.Inventory.Key
  ) {
    super(inventory, studentFolder, hostId);
  }

  public meta = new Metadata(this.inventory as Inventory, this.key);

  public get studentFolder() {
    return this.folder;
  }
}

namespace StudentFolder { }

export { StudentFolder as default };
