import lib from '../lib';
import Role from '../Role';
import CoursePlans from './CoursePlans';
import Folders from './Folders';
import MInventory from './Inventory';
import StudentFolders from './StudentFolders';

class Inventory {
  private constructor() {
    // static only
  }

  private static _formFoldersOfCoursePlans: Folders;
  public static get FormFoldersOfCoursePlans() {
    if (!this._formFoldersOfCoursePlans) {
      this._formFoldersOfCoursePlans = new Folders(
        'Plans Form Folder Inventory',
        (gradYear) =>
          lib.format.apply(lib.config.getFormFolderNameFormat(), {
            gradYear
          })
      );
    }
    return this._formFoldersOfCoursePlans;
  }

  public static FormFoldersOfStudentFolders = new Folders(
    'Folders Form Folder Inventory',
    (gradYear) =>
      lib.format.apply(lib.config.getFormFolderNameFormat(), {
        gradYear
      })
  );

  public static StudentFolders = new StudentFolders(
    'Student Folder Inventory',
    (hostId) =>
      lib.format.apply(
        lib.config.getStudentFolderNameFormat(),
        Role.Student.getByHostId(hostId.toString())
      )
  );

  private static _advisorFolders: Folders;
  public static get AdvisorFolders() {
    if (!this._advisorFolders) {
      this._advisorFolders = new Folders('Advisor Folder Inventory', (email) =>
        lib.format.apply(
          lib.config.getAdvisorFolderNameFormat(),
          Role.Advisor.getByEmail(email.toString())
        )
      );
    }
    return this._advisorFolders;
  }

  public static CoursePlans = new CoursePlans('Course Plan Inventory');
}

namespace Inventory {
  export type Key = MInventory.Key;
  export type Entry = MInventory.Entry;
  export type Formatter = MInventory.Formatter;
}

export { Inventory as default };
