import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import lib from '../lib';

export const pickStudentExpandDeptOptions = () => 'r_psedo';
global.r_psedo = () => {
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: planList(),
      message:
        'Please choose a student for whom to expand their options per department',
      actionName: 'Expand Dept. Options',
      callback: expandStudentDeptOptionsFor()
    },
    'Expand Dept. Options'
  );
};

const planList = () => 'r_pl';
const r_pl: g.HtmlService.Element.Picker.OptionsCallback = () =>
  Inventory.CoursePlans.all().map((p) => p.toOption());
global.r_pl = r_pl;

const expandStudentDeptOptionsFor = () => 'r_esdof';
global.r_esdof = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  const plan = Inventory.CoursePlans.get(hostId);
  plan.expandDeptOptionsIfFewerThanParams();
  lib.Progress.setComplete({
    html: `<div>Expanded dept.options for ${plan.student.getFormattedName()}.</div>
                <div><a id="button" class="btn btn-primary" onclick="google.script.host.close()" href="${plan.spreadsheet.getUrl()}" target="_blank">Open Plan</a></div>`
  });
};

export const expandAllDeptOptions = () => 'r_eado';
global.r_eado = () => {
  lib.Progress.reset();
  lib.Progress.showModalDialog(SpreadsheetApp, 'Expand Dept. Options');
  const plans = Inventory.CoursePlans.all();
  lib.Progress.setMax(plans.length * 2);
  plans.forEach((plan) => {
    lib.Progress.setStatus(`expanding dept. options if necessary`, plan);
    plan.expandDeptOptionsIfFewerThanParams();
  });
  lib.Progress.setComplete(true);
};
