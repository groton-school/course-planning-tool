import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Inventory from '../Inventory';

const ROLL_OVER_ACADEMIC_YEAR = 'ROLL_OVER_ACADEMIC_YEAR';

export const rolloverAcademicYear = () => 'y';
global.y = () => {
  const spreadsheet = SpreadsheetApp.getActive();
  const now = new Date();
  const meta = spreadsheet
    .createDeveloperMetadataFinder()
    .withKey(ROLL_OVER_ACADEMIC_YEAR)
    .find()
    .shift();
  const lastRollOver = new Date(meta?.getValue() || 0);
  if (now.getTime() - lastRollOver.getTime() < 11 * 30 * 24 * 60 * 60 * 1000) {
    throw new Error(
      'last academic year roll over was within the past 11 months'
    );
  }

  const progress = g.HtmlService.Element.Progress.bindTo(Utilities.getUuid());
  progress.reset();
  SpreadsheetApp.getUi().showModalDialog(
    progress.getHtmlOutput(),
    'Roll-over Academic Year'
  );

  progress.setMax(5);

  progress.setStatus('Preparing previous advisor list…');
  const previous = spreadsheet.getSheetByName('Advisor List (Previous Year)');
  const advisorList = spreadsheet.getSheetByName('Advisor List');
  const prevRows = previous.getMaxRows();
  const advRows = advisorList.getMaxRows();
  if (prevRows < advRows) {
    previous.insertRowsAfter(prevRows, advRows - prevRows);
  } else if (prevRows > advRows) {
    previous.deleteRows(advRows + 1, prevRows - advRows);
  }
  progress.incrementValue();

  progress.setStatus(
    'Archiving current advisor list to previous advisor list…'
  );
  previous.getRange('A:H').setValues(advisorList.getRange('A:H').getValues());
  progress.incrementValue();

  progress.setStatus('Resetting course plan permissions flags…');
  const plans = CoursePlan.coursePlanInventory
    .getSheet()
    .getRange(
      2,
      Inventory.CoursePlan.Columns.PermissionsUpdated,
      CoursePlan.coursePlanInventory.getSheet().getMaxRows() - 1,
      1
    )
    .uncheck();
  progress.incrementValue();

  progress.setStatus('Resetting Student Folder Inventory…');
  CoursePlan.studentFolderInventory
    .getSheet()
    .getRange(
      2,
      Inventory.StudentFolder.Columns.PermissionsUpdated,
      CoursePlan.studentFolderInventory.getSheet().getMaxRows() - 1,
      1
    )
    .uncheck();
  progress.incrementValue();

  progress.setStatus('Noting academic year roll-over');
  spreadsheet.addDeveloperMetadata(
    ROLL_OVER_ACADEMIC_YEAR,
    new Date().toUTCString()
  );
  progress.incrementValue();

  SpreadsheetApp.setActiveSheet(advisorList);
  progress.setComplete({
    html: `
    <p>Don't forget to:</p>
    <ol>
      <li>Update the Advisor List from Blackbaud</li>
      <li>Refresh the <code>Historical Enrollment</code> sheet (<a href="https://github.com/groton-school/course-planning-tool#refresh-historical-enrollment" target="_blank">directions</a>)</li>
    </ol>
    <a id="ok" class="btn btn-primary" href="#">Ok</a>
    <script>
      document.querySelector('#ok').addEventListener('click', () => google.script.host.close());
    </script>
    `
  });
};
