import * as Action from './Action';

export function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Course Planning')
        .addItem('Create all course plans', Action.CreateAll.getFunctionName())
        .addSeparator()
        .addItem('Create a single course plan…', Action.Create.getFunctionName())
        .addItem(
            'Update a course plan enrollment history…',
            Action.Update.getFunctionName()
        )
        .addItem('Delete all course plans', Action.DeleteAll.getFunctionName())
        .addToUi();
}

export function onInstall() {
    onOpen();
}
