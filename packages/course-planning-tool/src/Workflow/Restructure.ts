import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import lib from '../lib';

export const pickStudentExpandDeptOptions = () => 'r_psedo';
global.r_psedo = () => {
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: planList(),
      message:
        'Please choose a student for whom to expand their options per department',
      actionName: 'Expand Dept. Options',
      callback: expandStudentDeptOptionsFor()
    },
    'Expand Dept. Options'
  );
};

const planList = () => 'r_pl';
const r_pl: g.HtmlService.Element.Picker.OptionsCallback = () =>
  Inventory.CoursePlans.all()
    .map((p) => p.toOption())
    .sort();
global.r_pl = r_pl;

const expandStudentDeptOptionsFor = () => 'r_esdof';
global.r_esdof = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  const plan = Inventory.CoursePlans.get(hostId);
  plan.expandDeptOptionsIfFewerThanParams();
  lib.Progress.setCompleteLink({
    message: `Expanded dept.options for ${plan.student.formattedName}.`,
    url: plan.url
  });
};

export const expandAllDeptOptions = () => 'r_eado';
global.r_eado = (thread = Utilities.getUuid(), step = 0) => {
  lib.Progress.setThread(thread);
  new g.HtmlService.Element.Progress.Paged(
    thread,
    { root: SpreadsheetApp, title: 'Expand Dept. Options' },
    (step) => {
      const plans = Inventory.CoursePlans.all().filter(
        (plan) => plan.meta.active
      );
      lib.Progress.setMax(plans.length * 2);
      return plans.slice(step);
    },
    (plan) => plan.expandDeptOptionsIfFewerThanParams(),
    expandAllDeptOptions(),
    step
  );
};
