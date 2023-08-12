import g from '@battis/gas-lighter';
import lib from '../lib';

export const downloadEmptyCoursePlanningData = () => 'd_decpd';
global.d_decpd = () => {
  const progress = g.HtmlService.Element.Progress.bindTo(Utilities.getUuid());
  progress.reset();
  SpreadsheetApp.getUi().showModalDialog(
    progress.getHtmlOutput(),
    'Download clean copy of Course Planning Data'
  );

  const inventories = {
    [lib.CoursePlanningData.sheet.CoursePlanInventory]: false,
    [lib.CoursePlanningData.sheet.StudentFolderInventory]: false,
    [lib.CoursePlanningData.sheet.AdvisorFolderInventory]: true,
    [lib.CoursePlanningData.sheet.PlansFormFolderInventory]: true,
    [lib.CoursePlanningData.sheet.FoldersFormFolderInventory]: true
  };
  const imports = {
    [lib.CoursePlanningData.sheet.AdvisorList]: 8,
    [lib.CoursePlanningData.sheet.AdvisorListPreviousYear]: 8,
    [lib.CoursePlanningData.sheet.CourseList]: 5,
    [lib.CoursePlanningData.sheet.HistoricalEnrollment]: 14
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

  progress.setStatus(
    `Expunging ${lib.CoursePlanningData.sheet.Parameters} values…`
  );
  progress.incrementValue();
  cleanCopy
    .getSheetByName(lib.CoursePlanningData.sheet.Parameters)
    .getRange(lib.CoursePlanningData.namedRange.CleanParams)
    .setValues([[''], [''], ['']]);

  for (const inventory of Object.keys(inventories)) {
    progress.setStatus(`Clearing ${inventory}…`);
    progress.incrementValue();
    const hasRoot = inventories[inventory];
    const inventorySheet = cleanCopy.getSheetByName(inventory);
    inventorySheet.deleteRows(3, inventorySheet.getMaxRows() - 2);
    if (hasRoot) {
      inventorySheet
        .getRange(lib.CoursePlanningData.namedRange.CleanInventoryRoot)
        .setValues([
          [
            'ROOT',
            'FILE_ID',
            'https://drive.google.com/drive/folders/FOLDER_ID'
          ]
        ]);
    } else {
      inventorySheet
        .getRange(lib.CoursePlanningData.namedRange.CleanInventoryRoot)
        .setValues([['', '', '']]);
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

  progress.setStatus(
    `Clearing ${lib.CoursePlanningData.sheet.AvailableCourses}…`
  );
  progress.incrementValue();
  const available = cleanCopy.getSheetByName(
    lib.CoursePlanningData.sheet.AvailableCourses
  );
  available.deleteRows(4, available.getMaxRows() - 3);
  available
    .getRange(lib.CoursePlanningData.namedRange.CleanAvailableCourses)
    .setValue('');

  progress.setStatus(
    `Clearing student from ${lib.CoursePlanningData.sheet.IndividualEnrollmentHistory}…`
  );
  progress.incrementValue();
  const ieh = cleanCopy.getSheetByName(
    lib.CoursePlanningData.sheet.IndividualEnrollmentHistory
  );
  ieh
    .getRange(lib.CoursePlanningData.namedRange.CleanIEH)
    .setValues([[''], ['']]);

  const cleanUp = g.HtmlService.Element.Progress.bindTo(Utilities.getUuid());
  cleanUp.setStatus('Cleaning up…');

  progress.setComplete({
    html: `
            <a
                id="download"
                class="btn btn-primary"
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
                    google.script.run.withSuccessHandler(() => google.script.host.close()).${deleteTempFile()}('${cleanCopy.getId()}')
                });
            </script>
    `
  });
};

const deleteTempFile = () => 'd_dtf';
global.d_dtf = (id: string, delayInSeconds = 5) => {
  Utilities.sleep(delayInSeconds * 1000);
  DriveApp.getFileById(id).setTrashed(true);
};

export const downloadEmptyCoursePlanTemplate = () => 'd_decpt';
global.d_decpt = () => {
  const template = SpreadsheetApp.openByUrl(lib.config.getCoursePlanTemplate());
  SpreadsheetApp.getUi().showModalDialog(
    g.HtmlService.Template.createTemplate(
      `
        <html>
          <head>
            <?!= include('style', data) ?>
          </head>
          <body>
            <div id="content">
                <a
                    id="download"
                    class="btn btn-primary"
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
