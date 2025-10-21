const i = (col: string) => col.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);

class CoursePlanningData {
  private constructor() {}

  /**
   * Master list of sheet names _as they actually exist_ in the Course Planning Data spreadsheet
   */
  public static readonly sheet = {
    Legend: 'Legend',
    Parameters: 'Parameters',
    AvailableCourses: 'Available Courses',
    CrossRegisteredCourses: 'Cross-registered Courses',
    CoursePlanInventory: 'Course Plan Inventory',
    StudentFolderInventory: 'Student Folder Inventory',
    AdvisorFolderInventory: 'Advisor Folder Inventory',
    PlansFormFolderInventory: 'Plans Form Folder Inventory',
    FoldersFormFolderInventory: 'Folders Form Folder Inventory',
    StudentList: 'Student List',
    FacultyList:'Faculty List',
    AdvisorList: 'Advisor List',
    CourseList: 'Course List',
    CoursesByDepartment: 'Courses by Department',
    HistoricalEnrollment: 'Student Enrollments',
    IndividualEnrollmentHistory: 'Individual Enrollment History'
  };

  /**
   * Master list of named ranges _as they actually exist_ in the Course Planning Data spreadsheet
   */
  public static readonly namedRange = {
    ParamNumOptionsPerDepartment: 'Param_NumOptionsPerDepartment',
    ParamNumComments: 'Param_NumComments',
    ParamStudentNameFormat: 'Param_StudentNameFormat',
    ParamFormFolderNameFormat: 'Param_FormFolderNameFormat',
    ParamStudentFolderNameFormat: 'Param_StudentFolderNameFormat',
    ParamAdvisorFolderNameFormat: 'Param_AdvisorFolderNameFormat',
    ParamCoursePlanNameFormat: 'Param_CoursePlanNameFormat',
    ParamAcademicOffice: 'Param_AcademicOffice',
    ParamStudiesCommittee: 'Param_StudiesCommittee',
    ParamCollegeCounseling: 'Param_CollegeCounselingOffice',
    ParamCoursePlanTemplate: 'Param_CoursePlanTemplate',

    IEHHostIdSelector: 'IEH_HostID_Selector',
    IEHEnrollmentHistory: 'IEH_EnrollmentHistory',
    IEHDepartments: 'IEH_Departments',
    IEHNumericalYears: 'IEH_NumericalYears',
    IEHYears: 'IEH_Years',

    CleanParams: 'Clean_Params',
    CleanInventoryRoot: 'A2:C2',
    CleanAvailableCourses: 'Clean_AvailableCourses',
    CleanCrossRegisteredCourses: 'Clean_CrossRegisteredCourses',
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
    CoursePlans: {
      StudentEmail: i('D'),
      StudentFirstName: i('E'),
      StudentLastName: i('F'),
      GradYear: i('G'),
      FolderId: i('H'),
      AdvisorEmail: i('I'),
      AdvisorLastName: i('J'),
      AdvisorFolderId:i('K'),
      FormFolderId: i('L'),
      NumOptionsPerDepartment: i('M'),
      Inactive: i('N'),
      NewAdvisor: i('O'),
      CurrentAdvisor: i('P'),
      Version: i('Q'),
      Incomplete: i('R')
    },
    StudentFolders: {
      StudentEmail: i('D'),
      StudentFirstName: i('E'),
      StudentLastName: i('F'),
      GradYear:i('G'),
      Inactive: i('H'),
      NewAdvisor: i('I'),
      CurrentAdvisor: i('J'),
      CurrentShortcutLocation: i('K')
    },
    AdvisorFolders: {
      AdvisorEmail: i('D'),
      AdvisorLastName: i('E'),
      Inactive: i('F')
    },
    StudentList: {
      HostId: i('A'),
      Email: i('B'),
      FirstName: i('C'),
      Lastname: i('D'),
      GradYear: i('E'),
      HasPlan: i('F'),
      Inactive: i('G'),
      MenuListing: i('H')
    },
    AdvisorList: {
      HostId: i('A'),
      StudentEmail: i('B'),
      StudentFirstName: i('C'),
      StudentLastName: i('D'),
      GradYear: i('E'),
      BeginDate: i('F'),
      AdvisorEmail: i('G'),
      AdvisorFirstName: i('H'),
      AdvisorLastName: i('I'),
      CurrentAdvisor: i('J'),
      MostLikelyAdvisor: i('K'),
      AdvisorOnCoursePlan: i('L'),
      AdvisorFolderUrl: i('M')
    }
  };
}

namespace CoursePlanningData {
  export type SheetName =
    (typeof CoursePlanningData.sheet)[keyof typeof CoursePlanningData.sheet];
}

export { CoursePlanningData as default };
