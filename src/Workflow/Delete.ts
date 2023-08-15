import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import CoursePlan from '../Inventory/CoursePlans/CoursePlan';
import lib from '../lib';

export const pickPlan = () => 'd_pp';
global.d_pp = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: lib.Picker.allPlans(),
      message: 'Please select a student course plan to delete',
      actionName: 'Delete Course Plan',
      confirmation:
        'Are you sure that you want to delete this course plan? Recovery from this can be time-consuming.',
      callback: deletePlanFor()
    },
    'Delete Course Plan'
  );

const deletePlanFor = () => 'd_dpf';
global.d_dpf = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  lib.Progress.setMax(CoursePlan.stepCount.delete);
  Inventory.CoursePlans.get(hostId).delete();
  lib.Progress.setComplete(true);
};
