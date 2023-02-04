import State from '../State';
import { Terse } from '@battis/gas-lighter';

const P = Terse.HtmlService.Element.Progress.getInstance('delete-all');

global.action_deleteAll = () => {
  P.reset();
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createTemplateFromFile('templates/delete-all')
      .evaluate()
      .setHeight(100),
    'Delete All Course Plans'
  );
  const data = State.getDataSheet();
  const plans = data.getSheetByName('Course Plan Inventory');
  const advisors = data.getSheetByName('Advisor Folder Inventory');
  const forms = data.getSheetByName('Form Folder Inventory');
  P.setStatus('Deleting advisor folders');
  if (advisors.getMaxRows() > 2) {
    advisors
      .getRange('B3:B')
      .getValues()
      .forEach(([id]) => DriveApp.getFileById(id).setTrashed(true));
    advisors.deleteRows(3, advisors.getMaxRows() - 2);
  }
  P.setStatus('Deleting form folders');
  if (forms.getMaxRows() > 2) {
    forms
      .getRange('B3:B')
      .getValues()
      .forEach(([id]) => DriveApp.getFileById(id).setTrashed(true));
    forms.deleteRows(3, forms.getMaxRows() - 2);
  }
  P.setStatus('Cleaning up course plan inventory');
  if (plans.getMaxRows() > 2) {
    plans.deleteRows(3, plans.getMaxRows() - 2);
  }
  plans.getRange('A2:C2').setValues([['', '', '']]);
  P.setComplete('All course plans have been moved to the trash');
};

global.helper_deleteAll_getProgress = P.getProgress;

export default 'action_deleteAll';
