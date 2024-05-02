import MAdvisorFolders from './AdvisorFolders';
import MBase from './Base';
import MCoursePlans from './CoursePlans';
import MFolders from './Folders';
import FormFoldersOfCoursePlans from './FormFoldersOfCoursePlans';
import FormFoldersOfStudentFolders from './FormFoldersOfStudentFolders';
import MStudentFolders from './StudentFolders';

class Inventory {
  private constructor() { }

  public static FormFoldersOfCoursePlans =
    FormFoldersOfCoursePlans.getInstance();
  public static FormFoldersOfStudentFolders =
    FormFoldersOfStudentFolders.getInstance();
  public static StudentFolders = MStudentFolders.Inventory.getInstance();
  public static AdvisorFolders = MAdvisorFolders.Inventory.getInstance();
  public static CoursePlans = MCoursePlans.Inventory.getInstance();
}

namespace Inventory {
  export type Key = Base.Inventory.Key;
  export import Base = MBase;
  export namespace Module {
    export import CoursePlans = MCoursePlans;
    export import AdvisorFolders = MAdvisorFolders;
    export import StudentFolders = MStudentFolders;
    export import Folders = MFolders;
  }
}

export { Inventory as default };
