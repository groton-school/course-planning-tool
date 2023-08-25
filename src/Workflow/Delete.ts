import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import lib from '../lib';

export const pickStudent = () => 'd_ps';
global.d_pp = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: planList(),
      message: 'Please select a student to delete',
      actionName: 'Delete',
      confirmation:
        'Are you sure that you want to delete this student? Recovery from this can be time-consuming.',
      callback: deleteStudent()
    },
    'Delete Student',
    135
  );

const planList = () => 'd_pl';
const d_pl: g.HtmlService.Element.Picker.OptionsCallback = () =>
  Inventory.CoursePlans.all()
    .map((p) => p.toOption())
    .sort();
global.d_pl = d_pl;

const deleteStudent = () => 'd_ds';
global.d_ds = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  lib.Progress.setMax(parseInt(DELETE_STUDENT_STEPS));
  Inventory.CoursePlans.get(hostId).delete();
  lib.Progress.setComplete(true);
};

export const pickAdvisor = () => 'd_pa';
global.d_pa = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      message: 'Please select an advisor to delete',
      list: advisorList(),
      actionName: 'Delete',
      callback: deleteAdvisor()
    },
    'Delete Advisor'
  );

const advisorList = () => 'd_al';
const d_al: g.HtmlService.Element.Picker.OptionsCallback = () =>
  Inventory.AdvisorFolders.all()
    .map((folder) => folder.toOption())
    .sort();
global.d_al = d_al;

const deleteAdvisor = () => 'd_da';
global.d_da = (email: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  lib.Progress.setMax(parseInt(DELETE_ADVISOR_STEPS));
  Inventory.AdvisorFolders.get(email).delete();
  lib.Progress.setComplete(true);
};
