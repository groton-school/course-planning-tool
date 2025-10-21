import * as Workflow from './Workflow';

export function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Course Planning')
    .addItem('Create all course plans', Workflow.Create.all())
    .addItem('Create course plans by form…', Workflow.Create.pickForm())
    .addSeparator()
    .addItem(
      'Update all course plan enrollment histories',
      Workflow.UpdateEnrollmentHistory.all()
    )
    .addItem('Update all course plan enrollment histories from…', Workflow.UpdateEnrollmentHistory.pickFrom())
    .addItem(
      'Update all course plan course lists',
      Workflow.UpdateCourseList.all()
    )
    .addItem(
      'Assign all plans to current advisor',
      Workflow.AssignToCurrentAdvisor.all()
    )
    .addItem('Deactivate all inactive course plans', Workflow.Deactivate.all())
    .addItem('Expand comments in all plans', Workflow.ExpandComments.all())
    .addSeparator()
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu('Single Advisors')
        .addItem('Delete…', Workflow.Delete.pickAdvisor())
    )
    .addSeparator()
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu('Single Course Plan')
        .addItem('Create…', Workflow.Create.pickStudent())
        .addSeparator()
        .addItem(
          'Update enrollment history…',
          Workflow.UpdateEnrollmentHistory.pickPlan()
        )
        .addItem('Update course list…', Workflow.UpdateCourseList.pickPlan())
        .addItem(
          'Assign to current advisor…',
          Workflow.AssignToCurrentAdvisor.pickStudent()
        )
        .addItem('Deactivate inactive…', Workflow.Deactivate.pickStudent())
        .addItem('Expand comments…', Workflow.ExpandComments.pickStudent())
        .addSeparator()
        .addItem('Delete…', Workflow.Delete.pickStudent())
    )
    .addSeparator()
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu('Permissions')
        .addItem(
          'Reset a single course plan permissions…',
          Workflow.Permissions.pickPlanToResetPermissions()
        )
        .addSeparator()
        .addItem(
          'Reset Course Plan permissions',
          Workflow.Permissions.resetCoursePlanPermissions()
        )
        .addItem(
          'Reset Student Folder permissions',
          Workflow.Permissions.resetStudentFolderPermissions()
        )
        .addItem(
          'Reset Advisor Folder permissions',
          Workflow.Permissions.resetAdvisorFolderPermissions()
        )
    )
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu('Folders')
        .addItem(
          'Rename all student folders',
          Workflow.FolderRename.renameAllStudentFolders()
        )
        .addSeparator()
        .addItem(
          'Rename a student folder…',
          Workflow.FolderRename.pickStudentFolderToRename()
        )
    )
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu('Restructure')
        .addItem(
          "Expand a single course plan's dept. options…",
          Workflow.Restructure.pickStudentExpandDeptOptions()
        )
        .addItem(
          'Expand all dept options',
          Workflow.Restructure.expandAllDeptOptions()
        )
    )
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu('Documentation')
        .addItem(
          'Download clean copy of Course Planning Data',
          Workflow.Documentation.downloadEmptyCoursePlanningData()
        )
        .addItem(
          'Download clean copy of Course Plan Template',
          Workflow.Documentation.downloadEmptyCoursePlanTemplate()
        )
    )
    .addToUi();
}

export const onInstall = onOpen;
