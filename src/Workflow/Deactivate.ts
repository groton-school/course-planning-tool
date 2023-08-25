import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import lib from '../lib';

const inactivePlans = () => 'da_ip';
const da_ip: g.HtmlService.Element.Picker.OptionsCallback = () => {
  return Inventory.CoursePlans.all()
    .filter((plan) => plan.meta.inactive && !plan.meta.permissionsUpdated)
    .map((plan) => plan.toOption())
    .sort();
};
global.da_ip = da_ip;

const deactivate = () => 'da_d';
global.da_d = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  lib.Progress.setMax(parseInt(DEACTIVATE_STEPS));
  const plan = Inventory.CoursePlans.get(hostId);
  plan.deactivate();
  lib.Progress.setCompleteLink({
    message: `Deactivated inactive course plan for ${plan.student.formattedName}.`,
    url: {
      'Open Plan': plan.url,
      'Open Student Folder': plan.student.folder.url
    }
  });
};

export const pickStudent = () => 'da_ps';
global.da_ps = () => {
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      message: 'Please select an inactive student to deactivate',
      list: inactivePlans(),
      actionName: 'Deactivate',
      callback: deactivate()
    },
    'Deactivate'
  );
};

export const all = () => 'da_a';
global.da_a = (thread = Utilities.getUuid(), step = 0) => {
  lib.Progress.setThread(thread);
  new g.HtmlService.Element.Progress.Paged(
    thread,
    { root: SpreadsheetApp, title: 'Deactivate Inactive Plans' },
    (step) => {
      const plans = Inventory.CoursePlans.all().filter(
        (plan) => plan.meta.inactive && !plan.meta.permissionsUpdated
      );
      lib.Progress.setMax(plans.length * parseInt(DEACTIVATE_STEPS));
      return plans.slice(step);
    },
    (plan) => plan.deactivate(),
    all(),
    step
  );
};
