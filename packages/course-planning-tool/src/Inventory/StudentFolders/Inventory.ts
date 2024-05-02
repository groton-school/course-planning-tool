import Role from '../../Role';
import lib from '../../lib';
import Base from '../Base';
import Folders from '../Folders';
import FormFoldersOfStudentFolders from '../FormFoldersOfStudentFolders';
import StudentFolder from './StudentFolder';

class Inventory extends Folders.Inventory<StudentFolder> {
  private static _instance?: Inventory;
  public static getInstance(): Inventory {
    if (!this._instance) {
      this._instance = new Inventory(
        lib.CoursePlanningData.sheet.StudentFolderInventory,
        (hostId) =>
          lib.Format.apply(
            lib.Parameters.nameFormat.studentFolder,
            Role.Student.get(hostId.toString())
          )
      );
    }
    return this._instance;
  }

  protected creator(hostId: Base.Inventory.Key) {
    const student = Role.Student.get(hostId.toString());
    const folder = FormFoldersOfStudentFolders.getInstance()
      .get(student.gradYear)
      .driveFolder.createFolder(this.formatter(hostId));
    this.add({ key: hostId, id: folder.getId(), url: folder.getUrl() });
    return new StudentFolder(this, folder.getId(), hostId);
  }

  protected getter(folderId: string, hostId?: Base.Inventory.Key) {
    return new StudentFolder(this, folderId, hostId);
  }

  public refresh = (hostId: Base.Inventory.Key) => {
    this.get(hostId);
  };
}

namespace Inventory { }

export { Inventory as default };
