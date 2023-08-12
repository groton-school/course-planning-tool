import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import CoursePlan from '../Inventory/CoursePlans/CoursePlan';
import * as Picker from './Picker';

export const pickPlan = () => 'ueh_pp';
global.ueh_pp = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: Picker.allPlans(),
      message:
        'Please choose a student for whom to update their enrollment history',
      actionName: 'Update Enrollment History',
      callback: updateEnrollmentHistoryFor()
    },
    'Update Enrollment History'
  );

const updateEnrollmentHistoryFor = () => 'ueh_uehf';
global.ueh_uehf = (hostId: string, thread: string) => {
  const progress = g.HtmlService.Element.Progress.bindTo(thread);
  progress.reset();
  progress.setMax(CoursePlan.stepCount.updateEnrollmentHistory);
  CoursePlan.thread = thread;
  const plan = CoursePlan.for(hostId);
  plan.updateEnrollmentHistory();
  progress.setComplete({
    html: `<div>Updated course plan for ${plan.student.getFormattedName()}.</div>
          <div><a id="button" class="btn btn-primary" onclick="google.script.host.close()" href="${plan.spreadsheet.getUrl()}" target="_blank">Open Plan</a></div>`
  });
};

export const all = () => 'ueh_a';
global.ueh_a = () => {
  const progress = g.HtmlService.Element.Progress.bindTo(Utilities.getUuid());
  progress.reset();
  progress.showModalDialog(SpreadsheetApp, 'Update Enrollment Histories');
  CoursePlan.thread = progress.getThread();
  const plans = Inventory.CoursePlans.getAll();
  progress.setMax(plans.length * CoursePlan.stepCount.updateEnrollmentHistory);
  plans.forEach(([hostId]) => CoursePlan.for(hostId).updateEnrollmentHistory());
  progress.setComplete(true);
};
