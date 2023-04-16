import g from '@battis/gas-lighter';
import * as SheetParameters from '../CoursePlan/SheetParameters';

export const DownloadEmptyCoursePlanningData = () =>
  'downloadEmptyCoursePlanningData';
global.downloadEmptyCoursePlanningData = () => {
  const progress = g.HtmlService.Element.Progress.bindTo(Utilities.getUuid());
  progress.reset();
  SpreadsheetApp.getUi().showModalDialog(
    progress.getHtmlOutput(),
    'Download clean copy of Course Planning Data'
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

  const cleanUp = g.HtmlService.Element.Progress.bindTo(Utilities.getUuid());
  cleanUp.setStatus('Cleaning up…');

  progress.setComplete({
    html: `
            <a
                id="download"
                class="button action"
                target="_blank"
                href="${cleanCopy
        .getUrl()
        .replace(/\/edit.*/, '/export?format=xlsx')}"
            >
                Download ${cleanCopy.getName()}
            </a>
            <script>
                document.querySelector('#download').addEventListener('click', () => {
                    replaceContent(${JSON.stringify(cleanUp.getHtml())});
                    google.script.run.withSuccessHandler(() => google.script.host.close()).documentationDeleteTempFile('${cleanCopy.getId()}')
                });
            </script>
    `
  });
};

global.documentationDeleteTempFile = (id: string, delayInSeconds = 5) => {
  Utilities.sleep(delayInSeconds * 1000);
  DriveApp.getFileById(id).setTrashed(true);
};

export const DownloadEmptyCoursePlanTemplate = () =>
  'documentationDownloadEmptyCoursePlanTemplate';
global.documentationDownloadEmptyCoursePlanTemplate = () => {
  const template = SpreadsheetApp.openByUrl(
    SheetParameters.getCoursePlanTemplate()
  );
  SpreadsheetApp.getUi().showModalDialog(
    g.HtmlService.createTemplate(
      `
        <html>
          <head>
            <?!= include('style', data) ?>
          </head>
          <body>
            <div id="content">
                <a
                    id="download"
                    class="button action"
                    target="_blank"
                    href="${template
        .getUrl()
        .replace(/\/edit.*/, '/export?format=xlsx')}"
                >
                    Download ${template.getName()}
                </a>
                <script>
                    document.querySelector('#download').addEventListener('click', () => google.script.host.close());
                </script>
            </div>
        </body>
        </html>
        `
    ).setHeight(100),
    'Download clean copy of Course Plan Template'
  );
};
