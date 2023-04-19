import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Picker from './Picker';

export const pickStudentMissingFolder = () => 'k';
global.k = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: Picker.allPlans(),
      message:
        'Please choose a student for whom to create their missing student folder',
      actionName: 'Create Missing Folder',
      callback: createMissingStudentFolderFor()
    },
    'Create Missing Student Folder'
  );

const createMissingStudentFolderFor = () => 'l';
global.l = (hostId: string, thread: string) => {
  g.HtmlService.Element.Progress.reset(thread);
  CoursePlan.setThread(thread);
  CoursePlan.getByHostId(hostId).createStudentFolderIfMissing();
  g.HtmlService.Element.Progress.setComplete(thread, true);
};

export const createAllMissingStudentFolders = () => 'm';
global.m = () => {
  const thread = Utilities.getUuid();
  g.HtmlService.Element.Progress.reset(thread);
  CoursePlan.setThread(thread);
  const plans = CoursePlan.getAll();
  g.HtmlService.Element.Progress.setMax(thread, plans.length * 4);
  SpreadsheetApp.getUi().showModalDialog(
    g.HtmlService.Element.Progress.getHtmlOutput(thread),
    'Create Missing Student Folders'
  );
  plans.forEach(([hostId]) =>
    CoursePlan.getByHostId(hostId).createStudentFolderIfMissing()
  );
  g.HtmlService.Element.Progress.setComplete(thread, true);
};
