import { Terse } from '@battis/gas-lighter';

const P = Terse.HtmlService.Element.Progress;

global.action_deleteAll = () => {
    const thread = Utilities.getUuid();
    P.reset(thread);
    SpreadsheetApp.getUi().showModalDialog(
        Terse.HtmlService.createTemplateFromFile('templates/delete-all', {
            thread,
        }).setHeight(100),
        'Delete All Course Plans'
    );
    const data = SpreadsheetApp.getActive();
    const plans = data.getSheetByName('Course Plan Inventory');
    const advisors = data.getSheetByName('Advisor Folder Inventory');
    const forms = data.getSheetByName('Form Folder Inventory');
    P.setStatus(thread, 'Deleting advisor folders');
    if (advisors.getMaxRows() > 2) {
        advisors
            .getRange('B3:B')
            .getValues()
            .forEach(([id]) => DriveApp.getFileById(id).setTrashed(true));
        advisors.deleteRows(3, advisors.getMaxRows() - 2);
    }
    P.setStatus(thread, 'Deleting form folders');
    if (forms.getMaxRows() > 2) {
        forms
            .getRange('B3:B')
            .getValues()
            .forEach(([id]) => DriveApp.getFileById(id).setTrashed(true));
        forms.deleteRows(3, forms.getMaxRows() - 2);
    }
    P.setStatus(thread, 'Cleaning up course plan inventory');
    if (plans.getMaxRows() > 2) {
        plans.deleteRows(3, plans.getMaxRows() - 2);
    }
    plans.getRange('A2:C2').setValues([['', '', '']]);
    P.setComplete(thread, 'All course plans have been moved to the trash');
};

global.helper_deleteAll_getProgress = (thread: string) =>
    Terse.HtmlService.Element.Progress.getProgress(thread);
export default 'action_deleteAll';
