import lib from '../../lib';
import Role from '../../Role';
import Base from '../Base';
import Folders from '../Folders';
import FormFoldersOfStudentFolders from '../FormFoldersOfStudentFolders';
import StudentFolder from './StudentFolder';

class Inventory extends Folders.Inventory<StudentFolder> {
  private static _instance?: Inventory;
  public static getInstance(): Inventory {
    if (!this._instance) {
      this._instance = new Inventory();
    }
    return this._instance;
  }
  private constructor() {
    super(lib.CoursePlanningData.sheet.StudentFolderInventory, (hostId) =>
      lib.Format.apply(
        lib.Config.getStudentFolderNameFormat(),
        Role.Student.getByHostId(hostId.toString())
      )
    );
  }

  protected creator(hostId: Base.Inventory.Key) {
    const student = Role.Student.getByHostId(hostId.toString());
    const folder = FormFoldersOfStudentFolders.getInstance()
      .get(student.gradYear)
      .folder.createFolder(this.formatter(hostId));
    this.add([hostId, folder.getId(), folder.getUrl()]);

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
