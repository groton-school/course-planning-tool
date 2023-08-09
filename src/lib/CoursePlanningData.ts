export default {
  /**
   * Master list of sheet names _as they actually exist_ in the Course Planning Data spreadsheet
   */
  sheet: {
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
  },
  /**
   * Master list of named ranges _as they actually exist_ in the Course Planning Data spreadsheet
   */
  namedRange: {
    ParamNumOptionsPerDepartment: 'Param_NumOptionsPerDepartment',
    ParamNumComments: 'Param_NumComments',
    ParamFormFolderNameFormat: 'Param_FormFolderNameFormat',
    ParamStudentFolderNameFormat: 'Param_StudentFolderNameFormat',
    ParamAdvisorFolderNameFormat: 'Param_AdvisorFolderNameFormat',
    ParamCoursePlanNameFormat: 'Param_CoursePlanNameFormat',
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
    CleanIEH: 'Clean_IEH'
  }
};