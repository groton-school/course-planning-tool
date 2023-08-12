import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import lib from '../lib';

export const rolloverAcademicYear = () => 'a_ray';
global.a_ray = () => {
  const spreadsheet = SpreadsheetApp.getActive();
  const now = new Date();
  const lastRollOver = lib.config.getRollOverAcademicYear();
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

  progress.setStatus(
    `Preparing ${lib.CoursePlanningData.sheet.AdvisorListPreviousYear}…`
  );
  const previous = spreadsheet.getSheetByName(
    lib.CoursePlanningData.sheet.AdvisorListPreviousYear
  );
  const advisorList = spreadsheet.getSheetByName(
    lib.CoursePlanningData.sheet.AdvisorList
  );
  const prevRows = previous.getMaxRows();
  const advRows = advisorList.getMaxRows();
  if (prevRows < advRows) {
    previous.insertRowsAfter(prevRows, advRows - prevRows);
  } else if (prevRows > advRows) {
    previous.deleteRows(advRows + 1, prevRows - advRows);
  }
  progress.incrementValue();

  progress.setStatus(
    `Archiving ${lib.CoursePlanningData.sheet.AdvisorList} to ${lib.CoursePlanningData.sheet.AdvisorListPreviousYear}…`
  );
  previous.getRange('A:H').setValues(advisorList.getRange('A:H').getValues());
  progress.incrementValue();

  progress.setStatus('Resetting course plan permissions flags…');
  Inventory.CoursePlans.getSheet()
    .getRange(lib.CoursePlanningData.namedRange.RollOverCoursePlanPermissoons)
    .uncheck();
  progress.incrementValue();

  progress.setStatus(
    `Resetting ${lib.CoursePlanningData.sheet.StudentFolderInventory}…`
  );
  Inventory.StudentFolders.getSheet()
    .getRange(
      lib.CoursePlanningData.namedRange.RollOverStudentFolderPermissions
    )
    .uncheck();
  progress.incrementValue();

  progress.setStatus('Noting academic year roll-over');
  lib.config.setRollOverAcademicYear(new Date());
  progress.incrementValue();

  SpreadsheetApp.setActiveSheet(advisorList);
  progress.setComplete({
    html: `
    <p>Don't forget to:</p>
    <ol>
      <li>Update the Advisor List from Blackbaud</li>
      <li>Refresh the <code>${lib.CoursePlanningData.sheet.HistoricalEnrollment}</code> sheet (<a href="https://github.com/groton-school/course-planning-tool#refresh-historical-enrollment" target="_blank">directions</a>)</li>
    </ol>
    <a id="ok" class="btn btn-primary" href="#">Ok</a>
    <script>
      document.querySelector('#ok').addEventListener('click', () => google.script.host.close());
    </script>
    `
  });
};
