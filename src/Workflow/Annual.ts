import g from '@battis/gas-lighter';
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
  Inventory.CoursePlans.getSheet()
    .getRange(lib.CoursePlanningData.namedRange.RollOverCoursePlanPermissoons)
    .uncheck();

  lib.Progress.setStatus(
    `Resetting ${lib.CoursePlanningData.sheet.StudentFolderInventory}…`
  );
  Inventory.StudentFolders.getSheet()
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

const plansWithNewAdvisor = () => 'a_pwna';
global.a_pwna = () =>
  Inventory.CoursePlans.all()
    .filter((p) => p.meta.newAdvisor && !p.meta.permissionsUpdated)
    .map((p) => p.toOption());

export const pickStudentToAssignToCurrentAdvisor = () => 'a_pstatca';
global.a_pstatca = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      message: 'Please select a student to re-assign to their current advisor',
      list: plansWithNewAdvisor(),
      callback: assignToCurrentAdvisor(),
      actionName: 'Re-assign'
    },
    'Assign to Current Advisor'
  );

const assignToCurrentAdvisor = () => 'a_atca';
global.a_atca = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  lib.Progress.setMax(
    Inventory.Module.CoursePlans.CoursePlan.stepCount.reassign
  );
  const plan = Inventory.CoursePlans.get(hostId);
  plan.assignToCurrentAdvisor();
  lib.Progress.setComplete({
    html: `<div>Reassigned course plan for ${plan.student.getFormattedName()} to ${plan.advisor.getFormattedName()}.</div>
            <div>
              <a id="button" class="btn btn-primary" onclick="google.script.host.close()" href="${plan.spreadsheet.getUrl()}" target="_blank">Open Plan</a>
              <a id="button" class="btn btn-secondary" onclick="google.script.host.close()" href="${plan.student.folder.folder.getUrl()}" target="_blank">Open Student Folder</a>
              <a id="button" class="btn btn-secondary" onclick="google.script.host.close()" href="${plan.advisor.folder.getUrl()}" target="_blank">Open Advisor Folder</a>
            </div>`
  });
};

export const assignAllToCurrentAdvisor = () => 'a_aatca';
global.a_aatca = () => {
  lib.Progress.reset();
  lib.Progress.showModalDialog(SpreadsheetApp, 'Assign to Current Advisors');
  const plans = Inventory.CoursePlans.all().filter(
    (plan) => plan.meta.newAdvisor && !plan.meta.permissionsUpdated
  );
  lib.Progress.setMax(
    plans.length * Inventory.Module.CoursePlans.CoursePlan.stepCount.reassign
  );
  plans.forEach((plan) => plan.assignToCurrentAdvisor());
  lib.Progress.setComplete(true);
};

const plansToMakeInactive = () => 'a_ptmi';
const a_ptmi: g.HtmlService.Element.Picker.OptionsCallback = () => {
  return Inventory.CoursePlans.all()
    .filter((plan) => plan.meta.inactive && !plan.meta.permissionsUpdated)
    .map((plan) => plan.toOption());
};
global.a_ptmi = a_ptmi;

export const pickStudentToMakeInactive = () => 'a_pstmi';
global.a_pstmi = () => {
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      message: 'Please select a student to make inactive',
      list: plansToMakeInactive(),
      actionName: 'Make Inactive',
      callback: makePlanInactive()
    },
    'Make Inactive'
  );
};

const makePlanInactive = () => 'a_mpi';
global.a_mpi = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  lib.Progress.setMax(
    Inventory.Module.CoursePlans.CoursePlan.stepCount.inactive
  );
  const plan = Inventory.CoursePlans.get(hostId);
  plan.makeInactive();
  lib.Progress.setComplete({
    html: `<div>Made course plan for ${plan.student.getFormattedName()} inactive.</div>
            <div>
              <a id="button" class="btn btn-primary" onclick="google.script.host.close()" href="${plan.spreadsheet.getUrl()}" target="_blank">Open Plan</a>
              <a id="button" class="btn btn-secondary" onclick="google.script.host.close()" href="${plan.student.folder.folder.getUrl()}" target="_blank">Open Student Folder</a>
            </div>`
  });
};

export const makeAllPlansInactive = () => 'a_mapi';
global.a_mapi = () => {
  lib.Progress.reset();
  lib.Progress.showModalDialog(SpreadsheetApp, 'Deactivate Inactive Plans');
  const plans = Inventory.CoursePlans.all().filter(
    (plan) => plan.meta.inactive && !plan.meta.permissionsUpdated
  );
  lib.Progress.setMax(
    plans.length * Inventory.Module.CoursePlans.CoursePlan.stepCount.inactive
  );
  plans.forEach((plan) => plan.makeInactive());
  lib.Progress.setComplete(true);
};

const allActivePlans = () => 'a_aap';
const a_aap: g.HtmlService.Element.Picker.OptionsCallback = () =>
  Inventory.CoursePlans.all()
    .filter((plan) => plan.meta.active)
    .map((plan) => plan.toOption());

global.a_aap = a_aap;

export const pickStudentToExpandComments = () => 'a_pstec';
global.a_pstec = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      message: 'Please select a student for whose plan to expand comments',
      actionName: 'Expand Comments',
      list: allActivePlans(),
      callback: expandCommentsFor()
    },
    'Expand Comments'
  );

const expandCommentsFor = () => 'a_ecf';
global.a_ecf = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  const plan = Inventory.CoursePlans.get(hostId);
  plan.expandComments();
  lib.Progress.setComplete({
    html: `<div>Expanded comments for ${plan.student.getFormattedName()}.</div>
            <div>
              <a id="button" class="btn btn-primary" onclick="google.script.host.close()" href="${plan.spreadsheet.getUrl()}" target="_blank">Open Plan</a>
            </div>`
  });
};

export const expandAllComments = () => 'a_eac';
global.a_eac = (thread = Utilities.getUuid(), step = 0) => {
  lib.Progress.log({ thread, step });
  lib.Progress.setThread(thread);
  if (!step) {
    lib.Progress.reset();
    lib.Progress.showModalDialog(SpreadsheetApp, 'Expand Comments');
  }
  const plans = Inventory.CoursePlans.all().filter((plan) => plan.meta.active);
  lib.Progress.setMax(plans.length);
  for (let i = step; i < plans.length && i < 20; i++) {
    plans[i].expandComments();
    if (i >= step + 5) {
      lib.Progress.setComplete({ callback: expandAllComments(), step: i + 1 });
      return;
    }
  }
  lib.Progress.setComplete(true);
};
