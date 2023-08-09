import Folders from './Folders';

class AdvisorFolders extends Folders {
  /* public Cols = {
    ...super.Cols,
    PermissionsSet: 6
  };
  */
  public getPermissionsSet = (advisorEmail: Folders.Key) =>
    this.getMetadata(advisorEmail, 6);
  public setPermissionsSet = (advisorEmail: Folders.Key, value: boolean) =>
    this.setMetadata(advisorEmail, 6, value);
}

namespace AdvisorFolders { }

export { AdvisorFolders as default };
