import CoursePlan from '../CoursePlan';
import Role from '../Role';
import Folder from './Folder';
import Folders, { Metadata as FolderMetadata } from './Folders';
import Inventory from './Inventory';

class StudentFolders extends Folders {
  protected creator(hostId: Inventory.Key) {
    const folder = CoursePlan.getFormFolderForStudentFolderFor(
      Role.Student.getByHostId(hostId.toString())
    ).folder.createFolder(this.formatter(hostId));
    this.add([hostId, folder.getId(), folder.getUrl()]);
    return new Folder(this, folder, hostId);
  }

  public for(plan: CoursePlan) {
    return this.get(plan.hostId);
  }

  public metadataFor(hostId: Inventory.Key): Metadata {
    return new Metadata(this, hostId);
  }
}

export class Metadata extends FolderMetadata {
  public get inactive() {
    return this.inventory.getMetadata(this.k, 7);
  }
  public get newAdvisor() {
    return this.inventory.getMetadata(this.k, 8);
  }
  public get permissionsUpdated() {
    return this.inventory.getMetadata(this.k, 9);
  }
  public set permissionsUpdated(permissionsUpdated: boolean) {
    this.inventory.setMetadata(this.k, 9, permissionsUpdated);
  }
}

namespace StudentFolders { }

export { StudentFolders as default };
