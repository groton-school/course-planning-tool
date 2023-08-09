import CoursePlan from '../CoursePlan';
import Role from '../Role';
import Folders from './Folders';
import Inventory from './Inventory';

class StudentFolders extends Folders {
  protected creator(hostId: Inventory.Key): GoogleAppsScript.Drive.Folder {
    const folder = CoursePlan.getFormFolderForStudentFolderFor(
      Role.Student.getByHostId(hostId.toString())
    ).createFolder(this.formatter(hostId));
    this.add([hostId, folder.getId(), folder.getUrl()]);
    return folder;
  }

  public for(plan: CoursePlan) {
    return this.get(plan.hostId);
  }

  public getInactive = (key: Inventory.Key) => this.getMetadata(key, 7);
  public getNewAdvisor = (key: Inventory.Key) => this.getMetadata(key, 8);
  public getPermissionsUpdated = (key: Inventory.Key) =>
    this.getMetadata(key, 9);
  public setPermissionsUpdated = (key: Inventory.Key, value: boolean) =>
    this.setMetadata(key, 9, value);
}

namespace StudentFolders {
  /*  export enum Cols {
    Key = 1,
    Id = 2,
    Url = 3,
    FolderId = 2,
    FolderUrl = 3,
    HostId = 1,
    StudentFolderId = 2,
    StudentFolderUrl = 3,
    StudentEmail = 4,
    StudentFirstName = 5,
    StudentLastName = 6,
    Inactive = 7,
    NewAdvisor = 8,
    PermissionsUpdated = 9
  }*/
}

export { StudentFolders as default };
