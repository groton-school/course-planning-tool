import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import CoursePlan from '../Inventory/CoursePlans/CoursePlan';
import lib from '../lib';

const updateCourseListFor = () => 'ucl_uclf';
global.ucl_uclf = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  lib.Progress.setMax(CoursePlan.stepCount.updateCourseList);
  const plan = CoursePlan.for(hostId);
  plan.updateCourseList();
  lib.Progress.setComplete({
    html: `<div>Updated course list for ${plan.student.getFormattedName()}.</div>
            <div><a id="button" class="btn btn-primary" onclick="google.script.host.close()" href="${plan.spreadsheet.getUrl()}" target="_blank">Open Plan</a></div>`
  });
};

export const pickPlan = () => 'ucl_pp';
global.ucl_pp = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: lib.Picker.allPlans(),
      message: 'Please choose a student for whom to update their course list',
      actionName: 'Update Course List',
      callback: updateCourseListFor()
    },
    'Update Course List'
  );

export const all = () => 'ucl_a';
global.ucl_a = () => {
  lib.Progress.reset();
  lib.Progress.showModalDialog(SpreadsheetApp, 'Update Course Lists');
  const plans = Inventory.CoursePlans.all();
  lib.Progress.setMax(plans.length * CoursePlan.stepCount.updateCourseList);
  plans.forEach((plan) => plan.updateCourseList());
  lib.Progress.setComplete(true);
};
