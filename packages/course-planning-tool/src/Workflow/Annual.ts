import Inventory from '../Inventory';
import lib from '../lib';

export const rolloverAcademicYear = () => 'a_ray';
global.a_ray = () => {
  const spreadsheet = SpreadsheetApp.getActive();
  const now = new Date();
  const lastRollOver = lib.Parameters.rollOverAcademicYearDate;
  if (now.getTime() - lastRollOver.getTime() < 11 * 30 * 24 * 60 * 60 * 1000) {
    throw new Error(
      'last academic year roll over was within the past 11 months'
    );
  }

  lib.Progress.reset();
  lib.Progress.showModalDialog(SpreadsheetApp, 'Roll-over Academic Year');

  lib.Progress.setMax(5);

  lib.Progress.setStatus(
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

  lib.Progress.setStatus(
    `Archiving ${lib.CoursePlanningData.sheet.AdvisorList} to ${lib.CoursePlanningData.sheet.AdvisorListPreviousYear}…`
  );
  previous.getRange('A:H').setValues(advisorList.getRange('A:H').getValues());

  lib.Progress.setStatus('Resetting course plan permissions flags…');
  Inventory.CoursePlans.sheet
    .getRange(lib.CoursePlanningData.namedRange.RollOverCoursePlanPermissoons)
    .uncheck();

  lib.Progress.setStatus(
    `Resetting ${lib.CoursePlanningData.sheet.StudentFolderInventory}…`
  );
  Inventory.StudentFolders.sheet
    .getRange(
      lib.CoursePlanningData.namedRange.RollOverStudentFolderPermissions
    )
    .uncheck();

  lib.Progress.setStatus('Noting academic year roll-over');
  lib.Parameters.rollOverAcademicYearDate = new Date();

  SpreadsheetApp.setActiveSheet(advisorList);
  lib.Progress.setComplete({
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
