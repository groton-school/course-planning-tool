import AdvisorFolders from './AdvisorFolders';
import MBase from './Base';
import CoursePlans from './CoursePlans';
import FormFoldersOfCoursePlans from './FormFoldersOfCoursePlans';
import FormFoldersOfStudentFolders from './FormFoldersOfStudentFolders';
import StudentFolders from './StudentFolders';

class Inventory {
  private constructor() { }

  public static FormFoldersOfCoursePlans =
    FormFoldersOfCoursePlans.getInstance();
  public static FormFoldersOfStudentFolders =
    FormFoldersOfStudentFolders.getInstance();
  public static StudentFolders = StudentFolders.getInstance();
  public static AdvisorFolders = AdvisorFolders.getInstance();
  public static CoursePlans = CoursePlans.getInstance();
}

namespace Inventory {
  export type Key = Base.Inventory.Key;
  export import Base = MBase;
}

export { Inventory as default };
