import Folders, { Metadata as FolderMetadata } from './Folders';

class AdvisorFolders extends Folders {
  public metadataFor(advisorEmail: Folders.Key): Metadata {
    return new Metadata(this, advisorEmail);
  }
}

class Metadata extends FolderMetadata {
  public get permissionsSet() {
    return this.inventory.getMetadata(this.k, 6);
  }

  public set permissionsSet(permissionsSet: boolean) {
    this.inventory.setMetadata(this.k, 6, permissionsSet);
  }
}

namespace AdvisorFolders { }

export { AdvisorFolders as default };
