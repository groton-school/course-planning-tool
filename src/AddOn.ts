import * as Workflow from './Workflow';

export function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Course Planning')
        .addItem('Create all course plans', Workflow.Create.All())
        .addSeparator()
        .addItem('Create a single course plan…', Workflow.Create.Single())
        .addItem(
            'Update a course plan enrollment history…',
            Workflow.Update.Single()
        )
        .addItem('Delete all course plans', Workflow.Delete.All())
        .addToUi();
}

export const onInstall = onOpen;
