import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import Inventory from '../Inventory';
import * as Picker from './Picker';

export const pickStudentMissingFolder = () => 'r_psmf';
global.r_psmf = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: Picker.allPlans(),
      message:
        'Please choose a student for whom to create their missing student folder',
      actionName: 'Create Missing Folder',
      callback: createMissingStudentFolderFor()
    },
    'Create Missing Folder'
  );

const createMissingStudentFolderFor = () => 'r_cmsff';
global.r_cmsff = (hostId: string, thread: string) => {
  g.HtmlService.Element.Progress.reset(thread);
  Inventory.StudentFolders.createStudentFolderIfMissing(hostId, thread);
  g.HtmlService.Element.Progress.setComplete(thread, true);
};

export const createAllMissingStudentFolders = () => 'r_camsf';
global.r_camsf = () => {
  const progress = g.HtmlService.Element.Progress.bindTo(Utilities.getUuid());
  progress.reset();
  const plans = Inventory.CoursePlans.getAll();
  progress.setMax(plans.length * 4);
  SpreadsheetApp.getUi().showModalDialog(
    progress.getHtmlOutput(),
    'Create Missing Student Folders'
  );
  plans.forEach(([hostId]) =>
    Inventory.StudentFolders.createStudentFolderIfMissing(
      hostId,
      progress.getThread()
    )
  );
  progress.setComplete(true);
};

export const pickStudentExpandDeptOptions = () => 'r_psedo';
global.r_psedo = () => {
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: Picker.allPlans(),
      message:
        'Please choose a student for whom to expand their options per department',
      actionName: 'Expand Dept. Options',
      callback: expandStudentDeptOptionsFor()
    },
    'Expand Dept. Options'
  );
};

const expandStudentDeptOptionsFor = () => 'r_esdof';
global.r_esdof = (hostId: string, thread: string) => {
  g.HtmlService.Element.Progress.reset(thread);
  CoursePlan.thread = thread;
  const plan = CoursePlan.for(hostId);
  plan.expandDeptOptionsIfFewerThanParams();
  g.HtmlService.Element.Progress.setComplete(thread, {
    html: `<div>Expanded dept.options for ${plan.student.getFormattedName()}.</div>
                <div><a id="button" class="btn btn-primary" onclick="google.script.host.close()" href="${plan.spreadsheet.getUrl()}" target="_blank">Open Plan</a></div>`
  });
};

export const expandAllDeptOptions = () => 'r_eado';
global.r_eado = () => {
  const progress = g.HtmlService.Element.Progress.bindTo(Utilities.getUuid());
  progress.reset();
  SpreadsheetApp.getUi().showModalDialog(
    progress.getHtmlOutput(),
    'Expand Dept. Options'
  );
  CoursePlan.thread = progress.getThread();
  const plans = Inventory.CoursePlans.getAll();
  progress.setMax(plans.length * 2);
  plans.forEach(([hostId]) => {
    const plan = CoursePlan.for(hostId);
    progress.setStatus(
      `${plan.student.getFormattedName()} (expanding dept. options if necessary)`
    );
    plan.expandDeptOptionsIfFewerThanParams();
    progress.incrementValue();
  });
  progress.setComplete(true);
};
