import Create from './Actions/Create';
import CreateAll from './Actions/CreateAll';
import DeleteAll from './Actions/DeleteAll';

export function onOpen(event) {
    SpreadsheetApp.getUi()
        .createMenu('Course Planning')
        .addItem('Create all course plans', CreateAll)
        .addSeparator()
        .addItem('Create a single course plan…', Create)
        .addItem('Delete all course plans', DeleteAll)
        .addToUi();
}

export function onInstall(event) {
    onOpen(event);
}
