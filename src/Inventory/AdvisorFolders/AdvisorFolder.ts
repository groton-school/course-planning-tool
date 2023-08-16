import g from '@battis/gas-lighter';
import Role from '../../Role';
import Folders from '../Folders';
import Metadata from './/Metadata';

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

  public resetPermissions() {
    g.DriveApp.Permission.add(
      this.folder.getId(),
      this.key.toString(),
      g.DriveApp.Permission.Role.Reader
    );
  }
}

namespace AdvisorFolder { }

export { AdvisorFolder as default };
