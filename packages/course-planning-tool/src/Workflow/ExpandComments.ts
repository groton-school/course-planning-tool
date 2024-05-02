import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import lib from '../lib';

const allActivePlans = () => 'ec_aap';
const ec_aap: g.HtmlService.Element.Picker.OptionsCallback = () =>
  Inventory.CoursePlans.all()
    .filter((plan) => plan.meta.active)
    .map((plan) => plan.toOption());

global.ec_aap = ec_aap;

export const pickStudent = () => 'ec_ps';
global.ec_ps = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      message: 'Please select a student for whose plan to expand comments',
      actionName: 'Expand Comments',
      list: allActivePlans(),
      callback: forStudent()
    },
    'Expand Comments'
  );

const forStudent = () => 'ec_fs';
global.ec_fs = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  const plan = Inventory.CoursePlans.get(hostId);
  plan.expandComments();
  lib.Progress.setCompleteLink({
    message: `Expanded comments for ${plan.student.formattedName}.`,
    url: plan.spreadsheet.getUrl()
  });
};

export const all = () => 'ec_a';
global.ec_a = (thread = Utilities.getUuid(), step = 0) => {
  lib.Progress.setThread(thread);
  new g.HtmlService.Element.Progress.Paged(
    thread,
    {
      root: SpreadsheetApp,
      title: 'Expand Comments'
    },
    (step) => {
      const plans = Inventory.CoursePlans.all().filter(
        (plan) => plan.meta.active
      );
      lib.Progress.setMax(plans.length * 2);
      return plans.slice(step);
    },
    (plan) => plan.expandComments(),
    all(),
    step
  );
};
