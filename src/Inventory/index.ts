import lib from '../lib';
import Role from '../Role';
import AdvisorFolders from './AdvisorFolders';
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
        lib.CoursePlanningData.sheet.PlansFormFolderInventory,
        (gradYear) =>
          lib.format.apply(lib.config.getFormFolderNameFormat(), {
            gradYear
          })
      );
    }
    return this._formFoldersOfCoursePlans;
  }

  public static FormFoldersOfStudentFolders = new Folders(
    lib.CoursePlanningData.sheet.FoldersFormFolderInventory,
    (gradYear) =>
      lib.format.apply(lib.config.getFormFolderNameFormat(), {
        gradYear
      })
  );

  public static StudentFolders = new StudentFolders(
    lib.CoursePlanningData.sheet.StudentFolderInventory,
    (hostId) =>
      lib.format.apply(
        lib.config.getStudentFolderNameFormat(),
        Role.Student.getByHostId(hostId.toString())
      )
  );

  private static _advisorFolders: AdvisorFolders;
  public static get AdvisorFolders() {
    if (!this._advisorFolders) {
      this._advisorFolders = new AdvisorFolders(
        lib.CoursePlanningData.sheet.AdvisorFolderInventory,
        (email) =>
          lib.format.apply(
            lib.config.getAdvisorFolderNameFormat(),
            Role.Advisor.getByEmail(email.toString())
          )
      );
    }
    return this._advisorFolders;
  }

  public static CoursePlans = new CoursePlans(
    lib.CoursePlanningData.sheet.CoursePlanInventory
  );
}

namespace Inventory {
  export type Key = MInventory.Key;
  export type Entry = MInventory.Entry;
  export type Formatter = MInventory.Formatter;
}

export { Inventory as default };
