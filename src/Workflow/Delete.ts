import g from '@battis/gas-lighter';

const P = g.HtmlService.Element.Progress;

export const All = () => 'deleteAll';
global.deleteAll = () => {
    const thread = Utilities.getUuid();
    P.reset(thread);
    SpreadsheetApp.getUi().showModalDialog(
        g.HtmlService.createTemplateFromFile('templates/delete-all', {
            thread,
        }).setHeight(100),
        'Delete All Course Plans'
    );
};

global.deleteAllConfirmed = (thread) => {
    const data = SpreadsheetApp.getActive();
    const plans = data.getSheetByName('Course Plan Inventory');
    const advisors = data.getSheetByName('Advisor Folder Inventory');
    const forms = data.getSheetByName('Form Folder Inventory');
    P.setStatus(thread, 'Deleting advisor folders');
    P.setMax(thread, advisors.getMaxRows() + forms.getMaxRows() - 1);
    let counter = 0;
    if (advisors.getMaxRows() > 2) {
        advisors
            .getRange('B3:B')
            .getValues()
            .forEach(([id]) => {
                DriveApp.getFileById(id).setTrashed(true);
                P.setValue(thread, ++counter);
            });
        advisors.deleteRows(3, advisors.getMaxRows() - 2);
    }
    P.setStatus(thread, 'Deleting form folders');
    if (forms.getMaxRows() > 2) {
        forms
            .getRange('B3:B')
            .getValues()
            .forEach(([id]) => {
                DriveApp.getFileById(id).setTrashed(true);
                P.setValue(thread, ++counter);
            });
        forms.deleteRows(3, forms.getMaxRows() - 2);
    }
    P.setStatus(thread, 'Cleaning up course plan inventory');
    if (plans.getMaxRows() > 2) {
        plans.deleteRows(3, plans.getMaxRows() - 2);
    }
    plans.getRange('A2:C2').setValues([['', '', '']]);
    P.setComplete(thread, 'All course plans have been moved to the trash');
};
