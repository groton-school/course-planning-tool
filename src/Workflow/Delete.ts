import g from '@battis/gas-lighter';

const P = g.HtmlService.Element.Progress;

export const All = () => 'deleteAll';
global.deleteAll = () => {
    const thread = Utilities.getUuid();
    P.reset(thread);
    SpreadsheetApp.getUi().showModalDialog(
        g.HtmlService.createTemplateFromFile('templates/delete', {
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

    P.setMax(thread, advisors.getMaxRows() + forms.getMaxRows() - 1);

    const emptyFolder = (sheet: GoogleAppsScript.Spreadsheet.Sheet) => {
        if (sheet.getMaxRows() > 2) {
            sheet
                .getRange('B3:B')
                .getValues()
                .forEach(([id]) => {
                    const folder = DriveApp.getFolderById(id);
                    const files = folder.getFiles();
                    P.setStatus(thread, `Emptying “${folder.getName()}”`);
                    while (files.hasNext()) {
                        files.next().setTrashed(true);
                    }
                    P.incrementValue(thread);
                });
        }
    };
    emptyFolder(advisors);
    emptyFolder(forms);

    P.setStatus(thread, 'Cleaning up course plan inventory');
    if (plans.getMaxRows() > 2) {
        plans.deleteRows(3, plans.getMaxRows() - 2);
    }
    plans.getRange('A2:C2').setValues([['', '', '']]);
    P.setComplete(thread, 'All course plans have been moved to the trash');
};
