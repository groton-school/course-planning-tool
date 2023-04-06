import * as Workflow from './Workflow';

export function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Course Planning')
    .addItem('Create all course plans', Workflow.Create.All())
    .addItem('Create course plans by form…', Workflow.Create.ByForm())
    .addItem(
      'Update all course plan enrollment histories',
      Workflow.Update.All()
    )
    .addItem(
      'Update all course plan course lists',
      Workflow.UpdateCourseList.All()
    )
    .addSeparator()
    .addItem('Create a single course plan…', Workflow.Create.Single())
    .addItem(
      "Update a single course plan's enrollment history…",
      Workflow.Update.Single()
    )
    .addItem(
      "Update a single course plan's course list …",
      Workflow.UpdateCourseList.Single()
    )
    .addSeparator()
    .addItem(
      'Create a single missing student folder…',
      Workflow.Restructure.CreateMissingStudentFolder()
    )
    .addItem(
      'Create all missing student folders',
      Workflow.Restructure.CreateAllMissingStudentFolders()
    )
    .addItem('Delete a single course plan…', Workflow.Delete.Single())
    .addToUi();
}

export const onInstall = onOpen;
