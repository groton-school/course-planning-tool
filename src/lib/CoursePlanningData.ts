const i = (col: string) => col.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);

class CoursePlanningData {
  private constructor() { }

  /**
   * Master list of sheet names _as they actually exist_ in the Course Planning Data spreadsheet
   */
  public static readonly sheet = {
    Legend: 'Legend',
    Parameters: 'Parameters',
    AvailableCourses: 'Available Courses',
    CoursePlanInventory: 'Course Plan Inventory',
    StudentFolderInventory: 'Student Folder Inventory',
    AdvisorFolderInventory: 'Advisor Folder Inventory',
    PlansFormFolderInventory: 'Plans Form Folder Inventory',
    FoldersFormFolderInventory: 'Folders Form Folder Inventory',
    AdvisorList: 'Advisor List',
    AdvisorListPreviousYear: 'Advisor List (Previous Year)',
    CourseList: 'Course List',
    CoursesByDepartment: 'Courses by Department',
    HistoricalEnrollment: 'Historical Enrollment',
    IndividualEnrollmentHistory: 'Individual Enrollment History'
  };

  /**
   * Master list of named ranges _as they actually exist_ in the Course Planning Data spreadsheet
   */
  public static readonly namedRange = {
    ParamNumOptionsPerDepartment: 'Param_NumOptionsPerDepartment',
    ParamNumComments: 'Param_NumComments',
    ParamFormFolderNameFormat: 'Param_FormFolderNameFormat',
    ParamStudentFolderNameFormat: 'Param_StudentFolderNameFormat',
    ParamAdvisorFolderNameFormat: 'Param_AdvisorFolderNameFormat',
    ParamCoursePlanNameFormat: 'Param_CoursePlanNameFormat',
    ParamStudiesCommittee: 'Param_StudiesCommittee',
    ParamCollegeCounseling: 'Param_CollegeCounselingOffice',
    ParamCoursePlanTemplate: 'Param_CoursePlanTemplate',
    ParamRollOverAcademicYear: 'Param_RollOverAcademicYear',

    IEHHostIdSelector: 'IEH_HostID_Selector',
    IEHEnrollmentHistory: 'IEH_EnrollmentHistory',
    IEHDepartments: 'IEH_Departments',
    IEHNumericalYears: 'IEH_NumericalYears',
    IEHYears: 'IEH_Years',

    RollOverStudentFolderPermissions: 'RollOver_StudentFolderPermissions',
    RollOverCoursePlanPermissoons: 'RollOver_CoursePlanPermissions',

    CleanParams: 'Clean_Params',
    CleanInventoryRoot: 'A2:C2',
    CleanAvailableCourses: 'Clean_AvailableCourses',
    CleanIEH: 'Clean_IEH'
  };

  /**
   * Master list of columns _as they actually exist_ in the Course Planning Data spreadsheet
   */
  public static column = {
    Inventory: {
      Key: i('A'),
      Id: i('B'),
      Url: i('C')
    },
    AdvisorFolders: {
      PermissionsSet: i('F')
    },
    StudentFolders: {
      Inactive: i('G'),
      NewAdvisor: i('H'),
      PermissionsUpdated: i('I')
    },
    CoursePlans: {
      NumOptionsPerDepartment: i('N'),
      NumComments: i('O'),
      Inactive: i('P'),
      NewAdvisor: i('Q'),
      PermissionsUpdated: i('R'),
      Version: i('S')
    }
  };
}

namespace CoursePlanningData {
  export type SheetName =
    (typeof CoursePlanningData.sheet)[keyof typeof CoursePlanningData.sheet];
}

export { CoursePlanningData as default };
