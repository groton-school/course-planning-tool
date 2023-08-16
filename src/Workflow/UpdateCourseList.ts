import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import lib from '../lib';

const updateCourseListFor = () => 'ucl_uclf';
global.ucl_uclf = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  lib.Progress.setMax(
    Inventory.Module.CoursePlans.CoursePlan.stepCount.updateCourseList
  );
  const plan = Inventory.CoursePlans.get(hostId);
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
      list: planList(),
      message: 'Please choose a student for whom to update their course list',
      actionName: 'Update Course List',
      callback: updateCourseListFor()
    },
    'Update Course List'
  );

const planList = () => 'ucl_pl';
const ucl_pl: g.HtmlService.Element.Picker.OptionsCallback = () =>
  Inventory.CoursePlans.all().map((p) => p.toOption());
global.ucl_pl = ucl_pl;

export const all = () => 'ucl_a';
global.ucl_a = () => {
  lib.Progress.reset();
  lib.Progress.showModalDialog(SpreadsheetApp, 'Update Course Lists');
  const plans = Inventory.CoursePlans.all();
  lib.Progress.setMax(
    plans.length *
    Inventory.Module.CoursePlans.CoursePlan.stepCount.updateCourseList
  );
  plans.forEach((plan) => plan.updateCourseList());
  lib.Progress.setComplete(true);
};
