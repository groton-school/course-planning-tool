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
        .addSeparator()
        .addItem(
          'Assign a student to current advisor…',
          Workflow.Annual.pickStudentToAssignToCurrentAdvisor()
        )
        .addItem(
          'Assign all students to current advisor',
          Workflow.Annual.assignAllToCurrentAdvisor()
        )
    )
    .addSeparator()
    .addItem('Create a single course plan…', Workflow.Create.pickStudent())
    .addItem(
      "Update a single course plan's enrollment history…",
      Workflow.UpdateEnrollmentHistory.pickPlan()
    )
    .addItem(
      "Update a single course plan's course list…",
      Workflow.UpdateCourseList.pickPlan()
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
    .addItem('Delete a single course plan…', Workflow.Delete.pickPlan())
    .addSeparator()
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
