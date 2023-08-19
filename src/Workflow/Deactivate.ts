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
  lib.Progress.setMax(
    Inventory.Module.CoursePlans.CoursePlan.stepCount.inactive
  );
  const plan = Inventory.CoursePlans.get(hostId);
  plan.deactivate();
  lib.Progress.setCompleteLink({
    message: `Made course plan for ${plan.student.formattedName} inactive.`,
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
      message: 'Please select a student to make inactive',
      list: inactivePlans(),
      actionName: 'Make Inactive',
      callback: deactivate()
    },
    'Make Inactive'
  );
};

export const all = () => 'da_a';
global.da_a = () => {
  lib.Progress.reset();
  lib.Progress.showModalDialog(SpreadsheetApp, 'Deactivate Inactive Plans');
  const plans = Inventory.CoursePlans.all().filter(
    (plan) => plan.meta.inactive && !plan.meta.permissionsUpdated
  );
  lib.Progress.setMax(
    plans.length * Inventory.Module.CoursePlans.CoursePlan.stepCount.inactive
  );
  plans.forEach((plan) => plan.deactivate());
  lib.Progress.setComplete(true);
};
