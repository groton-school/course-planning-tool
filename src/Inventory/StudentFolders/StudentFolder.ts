import Inventories from '..';
import Role from '../../Role';
import Base from '../Base';
import Folders from '../Folders';
import Inventory from './Inventory';
import Metadata from './Metadata';

class StudentFolder extends Folders.Folder {
  public constructor(
    inventory: Inventory,
    studentFolder: GoogleAppsScript.Drive.Folder,
    hostId: Base.Inventory.Key
  ) {
    super(inventory, studentFolder, hostId);
  }

  public meta = new Metadata(this.inventory as Inventory, this.key);

  private _student?: Role.Student;
  public get student() {
    if (!this._student) {
      this._student = Role.Student.getByHostId(this.key.toString());
    }
    return this._student;
  }

  public get studentFolder(): GoogleAppsScript.Drive.Folder {
    return this.folder;
  }

  private _formFolder?: GoogleAppsScript.Drive.Folder;
  public get formFolder() {
    if (!this._formFolder) {
      this._formFolder = Inventories.FormFoldersOfStudentFolders.get(
        this.student.gradYear
      ).folder;
    }
    return this._formFolder;
  }
}

namespace StudentFolder { }

export { StudentFolder as default };
