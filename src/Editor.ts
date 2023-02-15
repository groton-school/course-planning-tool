import Create from './Actions/Create';
import CreateAll from './Actions/CreateAll';
import DeleteAll from './Actions/DeleteAll';

export function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Course Planning')
        .addItem('Create all course plans', CreateAll)
        .addSeparator()
        .addItem('Create a single course plan…', Create)
        .addItem('Delete all course plans', DeleteAll)
        .addToUi();
}

export function onInstall() {
    onOpen();
}
