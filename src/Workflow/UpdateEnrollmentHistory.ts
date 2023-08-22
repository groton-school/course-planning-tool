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
  Inventory.CoursePlans.all()
    .filter(
      (plan) =>
        plan.meta.active && plan.student.gradYear != lib.currentSchoolYear()
    )
    .map((p) => p.toOption())
    .sort();
global.ueh_pl = ueh_pl;

const updateEnrollmentHistoryFor = () => 'ueh_uehf';
global.ueh_uehf = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.setMax(CoursePlan.stepCount.updateEnrollmentHistory);
  const plan = Inventory.CoursePlans.get(hostId);
  plan.updateEnrollmentHistory();
  lib.Progress.setCompleteLink({
    message: `Updated course plan for ${plan.student.formattedName}.`,
    url: plan.url
  });
};

export const all = () => 'ueh_a';
global.ueh_a = (thread = Utilities.getUuid(), step = 0) => {
  lib.Progress.setThread(thread);
  new g.HtmlService.Element.Progress.Paged(
    thread,
    { root: SpreadsheetApp, title: 'Update Enrollment Histories' },
    (step) => {
      const plans = Inventory.CoursePlans.all().filter(
        (plan) =>
          plan.meta.active && plan.student.gradYear != lib.currentSchoolYear()
      );
      lib.Progress.setMax(
        plans.length *
        Inventory.Module.CoursePlans.CoursePlan.stepCount
          .updateEnrollmentHistory
      );
      return plans.slice(step);
    },
    (plan) => plan.updateEnrollmentHistory(),
    all(),
    step
  );
};
