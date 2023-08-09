import Folders from './Folders';

class AdvisorFolders extends Folders {
  public Cols = {
    ...super.Cols,
    PermissionsSet: 6
  };
}

namespace AdvisorFolders { }

export { AdvisorFolders as default };
