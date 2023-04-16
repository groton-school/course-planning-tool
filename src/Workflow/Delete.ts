import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Role from '../Role';

export const Single = () => 'deleteSingle';
global.deleteSingle = () => {
  SpreadsheetApp.getUi().showModalDialog(
    g.HtmlService.createTemplateFromFile('templates/restructure', {
      thread: Utilities.getUuid(),
      studentPicker: {
        message: 'Please select a student course plan to delete',
        actionName: 'Delete Course Plan',
        confirmation:
          'Are you sure that you want to delete this course plan? Recovery from this can be time-consuming.',
        callback: 'deleteSingleFor'
      }
    }).setHeight(100),
    'Delete Course Plan'
  );
};

global.deleteSingleFor = (hostId: string, thread: string) => {
  g.HtmlService.Element.Progress.reset(thread);
  const student = Role.Student.getByHostId(hostId);
  g.HtmlService.Element.Progress.setMax(
    thread,
    CoursePlan.getDeleteStepCount()
  );
  CoursePlan.for(student).delete();
  g.HtmlService.Element.Progress.setComplete(thread, true);
};
