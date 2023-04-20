import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Picker from './Picker';

export const pickPlan = () => 'e';
global.e = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: Picker.allPlans(),
      message: 'Please choose a student for whom to update their course list',
      actionName: 'Update Course List',
      callback: updateCourseListFor()
    },
    'Update Course List'
  );

const updateCourseListFor = () => 'f';
global.f = (hostId: string, thread: string) => {
  const progress = g.HtmlService.Element.Progress.bindTo(thread);
  progress.reset();
  CoursePlan.setThread(thread);
  progress.setMax(CoursePlan.getUpdateCourseListStepCount());
  const plan = CoursePlan.getByHostId(hostId);
  plan.updateCourseList();
  progress.setComplete({
    html: `<div>Updated course list for ${plan
      .getStudent()
      .getFormattedName()}.</div>
            <div><a id="button" class="btn btn-primary" onclick="google.script.host.close()" href="${plan
        .getSpreadsheet()
        .getUrl()}" target="_blank">Open Plan</a></div>`
  });
};

export const all = () => 'g';
global.g = () => {
  const progress = g.HtmlService.Element.Progress.bindTo(Utilities.getUuid());
  progress.reset();
  progress.showModalDialog(SpreadsheetApp, 'Update Course Lists');
  CoursePlan.setThread(progress.getThread());
  const plans = CoursePlan.getAll();
  progress.setMax(plans.length * CoursePlan.getUpdateCourseListStepCount());
  plans.forEach(([hostId]) =>
    CoursePlan.getByHostId(hostId).updateCourseList()
  );
  progress.setComplete(true);
};
