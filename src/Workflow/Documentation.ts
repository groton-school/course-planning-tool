import g from '@battis/gas-lighter';

export const DownloadExpurgatedCoursePlanningData = () =>
  'downloadExpurgatedCoursePlanningData';
global.downloadExpurgatedCoursePlanningData = () => {
  const progress = g.HtmlService.Element.Progress.bindTo(Utilities.getUuid());
  progress.reset();
  SpreadsheetApp.getUi().showModalDialog(
    progress.getHtmlOutput(),
    'Get Clean Copy'
  );

  const inventories = {
    'Course Plan Inventory': false,
    'Student Folder Inventory': false,
    'Advisor Folder Inventory': true,
    'Plans Form Folder Inventory': true,
    'Folders Form Folder Inventory': true
  };
  const imports = {
    'Advisor List': 8,
    'Course List': 5,
    'Historical Enrollment': 14
  };
  progress.setMax(
    3 + Object.keys(inventories).length + Object.keys(imports).length
  );

  progress.setStatus('Making clean copy…');
  progress.incrementValue();
  const original = SpreadsheetApp.getActive();
  const cleanCopyFile = DriveApp.getFileById(original.getId()).makeCopy(
    DriveApp.getRootFolder()
  );
  const cleanCopy = SpreadsheetApp.openById(cleanCopyFile.getId());
  cleanCopyFile.setName(original.getName());

  progress.setStatus('Expunging parameter values…');
  progress.incrementValue();
  cleanCopy
    .getSheetByName('Parameters')
    .getRange('B7:B9')
    .setValues([[''], [''], ['']]);

  for (const inventory of Object.keys(inventories)) {
    progress.setStatus(`Clearing ${inventory}…`);
    progress.incrementValue();
    const hasRoot = inventories[inventory];
    const inventorySheet = cleanCopy.getSheetByName(inventory);
    inventorySheet.deleteRows(3, inventorySheet.getMaxRows() - 2);
    if (hasRoot) {
      inventorySheet
        .getRange('A2:C2')
        .setValues([
          [
            'ROOT',
            'FILE_ID',
            'https://drive.google.com/drive/folders/FOLDER_ID'
          ]
        ]);
    } else {
      inventorySheet.getRange('A2:C2').setValues([['', '', '']]);
    }
  }

  for (const importName of Object.keys(imports)) {
    progress.setStatus(`Clearing ${importName}…`);
    progress.incrementValue();
    const importWidth = imports[importName];
    const importSheet = cleanCopy.getSheetByName(importName);
    importSheet.deleteRows(3, importSheet.getMaxRows() - 2);
    importSheet
      .getRange(2, 1, 1, importWidth)
      .setValues([Array(importWidth).fill('')]);
  }

  progress.setStatus('Clearing Available Courses…');
  progress.incrementValue();
  const available = cleanCopy.getSheetByName('Available Courses');
  available.deleteRows(4, available.getMaxRows() - 3);
  available.getRange('A3').setValue('');

  progress.setStatus('Clearing student from Individual Enrollment History…');
  progress.incrementValue();
  const ieh = cleanCopy.getSheetByName('Individual Enrollment History');
  ieh.getRange('A1:A2').setValues([[''], ['']]);

  progress.setComplete({
    html: `<a class="button action" target="_blank" onclick="google.script.host.close()" href="${cleanCopy
      .getUrl()
      .replace(
        /\/edit.*/,
        '/export?format=xlsx'
      )}">Download ${cleanCopy.getName()}.xlsx</a>`
  });
};
