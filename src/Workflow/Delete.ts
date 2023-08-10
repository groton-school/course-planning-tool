import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import Role from '../Role';
import * as Picker from './Picker';

export const pickPlan = () => 'q';
global.q = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: Picker.allPlans(),
      message: 'Please select a student course plan to delete',
      actionName: 'Delete Course Plan',
      confirmation:
        'Are you sure that you want to delete this course plan? Recovery from this can be time-consuming.',
      callback: deletePlanFor()
    },
    'Delete Course Plan'
  );

const deletePlanFor = () => 'r';
global.r = (hostId: string, thread: string) => {
  g.HtmlService.Element.Progress.reset(thread);
  const student = Role.Student.getByHostId(hostId);
  g.HtmlService.Element.Progress.setMax(thread, CoursePlan.stepCount.delete);
  CoursePlan.for(student).delete();
  g.HtmlService.Element.Progress.setComplete(thread, true);
};
