import lib from '../../lib';
import Role from '../../Role';
import Inventory from './Inventory';
import MMetadata from './Metadata';
import MStudentFolder from './StudentFolder';

class StudentFolders extends Inventory {
  private static _instance?: StudentFolders;
  public static getInstance(): StudentFolders {
    if (!this._instance) {
      this._instance = new StudentFolders(
        lib.CoursePlanningData.sheet.StudentFolderInventory,
        (hostId) =>
          lib.format.apply(
            lib.config.getStudentFolderNameFormat(),
            Role.Student.getByHostId(hostId.toString())
          )
      );
    }
    return this._instance;
  }
}

namespace StudentFolders {
  export import StudentFolder = MStudentFolder;
  export import Metadata = MMetadata;
}

export { StudentFolders as default };
