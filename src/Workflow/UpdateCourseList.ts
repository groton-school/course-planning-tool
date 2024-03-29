import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import lib from '../lib';

const updateCourseListFor = () => 'ucl_uclf';
global.ucl_uclf = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  lib.Progress.setMax(parseInt(UPDATE_COURSE_LIST_STEPS));
  const plan = Inventory.CoursePlans.get(hostId);
  plan.updateCourseList();
  lib.Progress.setCompleteLink({
    message: `Updated course list for ${plan.student.formattedName}.`,
    url: plan.url
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
  Inventory.CoursePlans.all()
    .filter(
      (plan) =>
        plan.meta.active && plan.student.gradYear != lib.currentSchoolYear()
    )
    .map((p) => p.toOption())
    .sort();
global.ucl_pl = ucl_pl;

export const all = () => 'ucl_a';
global.ucl_a = (thread = Utilities.getUuid(), step = 0) => {
  lib.Progress.setThread(thread);
  new g.HtmlService.Element.Progress.Paged(
    thread,
    { root: SpreadsheetApp, title: 'Update Course Lists' },
    (step) => {
      const plans = Inventory.CoursePlans.all().filter(
        (plan) =>
          plan.meta.active && plan.student.gradYear != lib.currentSchoolYear()
      );
      lib.Progress.setMax(plans.length * parseInt(UPDATE_COURSE_LIST_STEPS));
      return plans.slice(step);
    },
    (plan) => plan.updateCourseList(),
    all(),
    step
  );
};
