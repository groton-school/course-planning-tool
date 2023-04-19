import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Picker from './Picker';

export const pickPlan = () => 'h';
global.h = () =>
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

const updateEnrollmentHistoryFor = () => 'i';
global.i = (hostId: string, thread: string) => {
  const progress = g.HtmlService.Element.Progress.bindTo(thread);
  progress.reset();
  progress.setMax(CoursePlan.getUpdateEnrollmentHistoryStepCount());
  CoursePlan.setThread(thread);
  const plan = CoursePlan.getByHostId(hostId);
  plan.updateEnrollmentHistory();
  progress.setComplete({
    html: `<div>Updated course plan for ${plan
      .getStudent()
      .getFormattedName()}.</div>
          <div><a id="button" class="button action" onclick="google.script.host.close()" href="${plan
        .getSpreadsheet()
        .getUrl()}" target="_blank">Open Plan</a></div>`
  });
};

export const all = () => 'j';
global.j = () => {
  const progress = g.HtmlService.Element.Progress.bindTo(Utilities.getUuid());
  progress.reset();
  progress.showModalDialog(SpreadsheetApp, 'Update Enrollment Histories');
  CoursePlan.setThread(progress.getThread());
  const plans = CoursePlan.getAll();
  progress.setMax(
    plans.length * CoursePlan.getUpdateEnrollmentHistoryStepCount()
  );
  plans.forEach(([hostId]) =>
    CoursePlan.getByHostId(hostId).updateEnrollmentHistory()
  );
  progress.setComplete(true);
};
