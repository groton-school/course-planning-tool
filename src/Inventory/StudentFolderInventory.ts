import CoursePlan from '../CoursePlan';
import * as Role from '../Role';
import FolderInventory from './FolderInventory';
import Inventory, { Key as InventoryKey } from './Inventory';

export default class StudentFolderInventory extends FolderInventory {
  public static Columns = {
    ...FolderInventory.Columns,
    HostId: Inventory.Columns.Key,
    StudentFolderId: FolderInventory.Columns.FolderId,
    StudentFolderUrl: FolderInventory.Columns.FolderUrl,
    StudentEmail: 4,
    StudentFirstName: 5,
    StudentLastName: 6,
    Inactive: 7,
    NewAdvisor: 8,
    PermissionsUpdated: 9
  };
  protected creator(hostId: InventoryKey): GoogleAppsScript.Drive.Folder {
    const folder = CoursePlan.getFormFolderForStudentFolderFor(
      Role.Student.getByHostId(hostId.toString())
    ).createFolder(this.formatter(hostId));
    this.add([hostId, folder.getId(), folder.getUrl()]);
    return folder;
  }
}
