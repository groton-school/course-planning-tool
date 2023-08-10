import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import Inventory from '../Inventory';
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
  CoursePlan.thread = thread;
  progress.setMax(CoursePlan.stepCount.updateCourseList);
  const plan = CoursePlan.for(hostId);
  plan.updateCourseList();
  progress.setComplete({
    html: `<div>Updated course list for ${plan.student.getFormattedName()}.</div>
            <div><a id="button" class="btn btn-primary" onclick="google.script.host.close()" href="${plan.spreadsheet.getUrl()}" target="_blank">Open Plan</a></div>`
  });
};

export const all = () => 'g';
global.g = () => {
  const progress = g.HtmlService.Element.Progress.bindTo(Utilities.getUuid());
  progress.reset();
  progress.showModalDialog(SpreadsheetApp, 'Update Course Lists');
  CoursePlan.thread = progress.getThread();
  const plans = Inventory.CoursePlans.getAll();
  progress.setMax(plans.length * CoursePlan.stepCount.updateCourseList);
  plans.forEach(([hostId]) => CoursePlan.for(hostId).updateCourseList());
  progress.setComplete(true);
};
