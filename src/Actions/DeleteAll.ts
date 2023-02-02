import State from '../State';

global.action_deleteAll = () => {
  State.resetComplete();
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
  State.setProgress('Deleting advisor folders');
  if (advisors.getMaxRows() > 2) {
    advisors
      .getRange('B3:B')
      .getValues()
      .forEach(([id]) => DriveApp.getFileById(id).setTrashed(true));
    advisors.deleteRows(3, advisors.getMaxRows() - 2);
  }
  State.setProgress('Deleting form folders');
  if (forms.getMaxRows() > 2) {
    forms
      .getRange('B3:B')
      .getValues()
      .forEach(([id]) => DriveApp.getFileById(id).setTrashed(true));
    forms.deleteRows(3, forms.getMaxRows() - 2);
  }
  State.setProgress('Cleaning up course plan inventory');
  if (plans.getMaxRows() > 2) {
    plans.deleteRows(3, plans.getMaxRows() - 2);
  }
  plans.getRange('A2:C2').setValues([['', '', '']]);
  State.setComplete('All course plans have been moved to the trash');
};

global.helper_deleteAll_progress = () => {
  return { progress: State.getProgress(), complete: State.getComplete() };
};

export default 'action_deleteAll';
