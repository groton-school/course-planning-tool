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
        .addSeparator()
        .addItem('Create a single course plan…', Workflow.Create.Single())
        .addItem(
            'Update a single course plan enrollment history…',
            Workflow.Update.Single()
        )
        .addItem("Update a single course plan's course list …", Workflow.UpdateCourseList.Single())
        .addSeparator()
        .addItem('Delete all course plans', Workflow.Delete.All())
        .addToUi();
}

export const onInstall = onOpen;
