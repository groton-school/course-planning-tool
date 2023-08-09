import CoursePlan from '../CoursePlan';
import Role from '../Role';
import Folders from './Folders';
import Inventory from './Inventory';

class StudentFolders extends Folders {
  public Cols = {
    ...super.Cols,
    HostId: super.Cols.Key,
    StudentFolderId: super.Cols.FolderId,
    StudentFolderUrl: super.Cols.FolderUrl,
    StudentEmail: 4,
    StudentFirstName: 5,
    StudentLastName: 6,
    Inactive: 7,
    NewAdvisor: 8,
    PermissionsUpdated: 9
  };

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
}

namespace StudentFolders { }

export { StudentFolders as default };
