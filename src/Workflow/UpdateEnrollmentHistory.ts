import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import CoursePlan from '../Inventory/CoursePlans/CoursePlan';
import lib from '../lib';

export const pickPlan = () => 'ueh_pp';
global.ueh_pp = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: planList(),
      message:
        'Please choose a student for whom to update their enrollment history',
      actionName: 'Update Enrollment History',
      callback: updateEnrollmentHistoryFor()
    },
    'Update Enrollment History'
  );

const planList = () => 'ueh_pl';
const ueh_pl: g.HtmlService.Element.Picker.OptionsCallback = () =>
  Inventory.CoursePlans.all().map((p) => p.toOption());
global.ueh_pl = ueh_pl;

const updateEnrollmentHistoryFor = () => 'ueh_uehf';
global.ueh_uehf = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.setMax(CoursePlan.stepCount.updateEnrollmentHistory);
  const plan = Inventory.CoursePlans.get(hostId);
  plan.updateEnrollmentHistory();
  lib.Progress.setComplete({
    html: `<div>Updated course plan for ${plan.student.getFormattedName()}.</div>
          <div><a id="button" class="btn btn-primary" onclick="google.script.host.close()" href="${plan.spreadsheet.getUrl()}" target="_blank">Open Plan</a></div>`
  });
};

export const all = () => 'ueh_a';
global.ueh_a = () => {
  lib.Progress.reset();
  lib.Progress.showModalDialog(SpreadsheetApp, 'Update Enrollment Histories');
  const plans = Inventory.CoursePlans.all();
  lib.Progress.setMax(
    plans.length * CoursePlan.stepCount.updateEnrollmentHistory
  );
  plans.forEach((plan) => plan.updateEnrollmentHistory());
  lib.Progress.setComplete(true);
};
