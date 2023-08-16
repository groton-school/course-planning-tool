import * as Workflow from './Workflow';

export function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Course Planning')
    .addItem('Create all course plans', Workflow.Create.all())
    .addItem('Create course plans by form…', Workflow.Create.pickForm())
    .addItem(
      'Update all course plan enrollment histories',
      Workflow.UpdateEnrollmentHistory.all()
    )
    .addItem(
      'Update all course plan course lists',
      Workflow.UpdateCourseList.all()
    )
    .addSeparator()
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu('Roll-over Academic Year')
        .addItem(
          'Roll-over Student/Advisor Lists',
          Workflow.Annual.rolloverAcademicYear()
        )
        .addItem(
          'Assign all plans to current advisor',
          Workflow.Annual.assignAllToCurrentAdvisor()
        )
        .addItem(
          'Deactivate all inactive course plans',
          Workflow.Annual.makeAllPlansInactive()
        )
        .addSeparator()
        .addItem(
          'Assign a plan to current advisor…',
          Workflow.Annual.pickStudentToAssignToCurrentAdvisor()
        )
        .addItem(
          'Deactivate an inactive course plan…',
          Workflow.Annual.pickStudentToMakeInactive()
        )
    )
    .addSeparator()
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu('For a single course plan…')
        .addItem('Create…', Workflow.Create.pickStudent())
        .addItem(
          'Update enrollment history…',
          Workflow.UpdateEnrollmentHistory.pickPlan()
        )
        .addItem('Update course list…', Workflow.UpdateCourseList.pickPlan())
        .addSeparator()
        .addItem('Delete…', Workflow.Delete.pickPlan())
    )
    .addSeparator()
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu('Restructure')
        .addItem(
          'Reset folder permissions',
          Workflow.Restructure.resetFolderPermissions()
        )
        .addSeparator()
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
