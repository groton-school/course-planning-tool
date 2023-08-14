import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import CoursePlans from '../Inventory/CoursePlans';
import * as Picker from './Picker';

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
  CoursePlans.CoursePlan.thread = thread;
  const plan = Inventory.CoursePlans.get(hostId);
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
  CoursePlans.CoursePlan.thread = progress.getThread();
  const plans = Inventory.CoursePlans.all();
  progress.setMax(plans.length * 2);
  plans.forEach((plan) => {
    progress.setStatus(
      `${plan.student.getFormattedName()} (expanding dept. options if necessary)`
    );
    plan.expandDeptOptionsIfFewerThanParams();
    progress.incrementValue();
  });
  progress.setComplete(true);
};
