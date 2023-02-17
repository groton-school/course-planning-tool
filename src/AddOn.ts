import * as Workflow from './Workflow';

export function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Course Planning')
        .addItem('Create all course plans', Workflow.Create.All())
        .addItem(
            'Update all course plan enrollment histories',
            Workflow.Update.All()
        )
        .addSeparator()
        .addItem('Create a single course plan…', Workflow.Create.Single())
        .addItem(
            'Update a course plan enrollment history…',
            Workflow.Update.Single()
        )
        .addSeparator()
        .addItem('Delete all course plans', Workflow.Delete.All())
        .addToUi();
}

export const onInstall = onOpen;
