import g from '@battis/gas-lighter';
import Role from '../../Role';
import Base from '../Base';
import Folders from '../Folders';
import Metadata from './/Metadata';
import Inventory from './Inventory';

class AdvisorFolder extends Folders.Folder {
  public meta: Metadata;

  private _advisor?: Role.Advisor;
  public get advisor() {
    if (!this._advisor) {
      this._advisor = Role.Advisor.getByEmail(this.key.toString());
    }
    return this._advisor;
  }

  public get advisorFolder() {
    return this.folder;
  }
  public constructor(
    inventory: Inventory,
    folderId: string,
    advisorEmail: Base.Inventory.Key
  ) {
    super(inventory, folderId, advisorEmail);
    this.meta = new Metadata(this.inventory as Inventory, this.key);
    if (!this.meta.permissionsSet) {
      g.DriveApp.Permission.add(
        this.folder.getId(),
        this.advisor.email,
        g.DriveApp.Permission.Role.Reader
      );
      this.meta.permissionsSet = true;
    }
  }
}

namespace AdvisorFolder { }

export { AdvisorFolder as default };
