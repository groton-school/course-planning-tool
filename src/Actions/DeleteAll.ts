import State from '../State';

function deleteAll() {
  const data = State.getDataSheet();
  const plans = data.getSheetByName('Course Plan Inventory');
  const advisors = data.getSheetByName('Advisor Folder Inventory');
  const forms = data.getSheetByName('Form Folder Inventory');
  if (advisors.getMaxRows() > 2) {
    advisors
      .getRange('B3:B')
      .getValues()
      .forEach(([id]) => DriveApp.getFileById(id).setTrashed(true));
    advisors.deleteRows(3, advisors.getMaxRows() - 2);
  }
  if (forms.getMaxRows() > 2) {
    forms
      .getRange('B3:B')
      .getValues()
      .forEach(([id]) => DriveApp.getFileById(id).setTrashed(true));
    forms.deleteRows(3, forms.getMaxRows() - 2);
  }
  if (plans.getMaxRows() > 2) {
    plans.deleteRows(3, plans.getMaxRows() - 2);
    plans.getRange('A2:C2').setValues([['', '', '']]);
  }

  // TODO finish deleteAll by making course plan inventory active sheet
}

global.action_coursePlan_deleteAll = deleteAll;
export default 'action_coursePlan_deleteAll';
