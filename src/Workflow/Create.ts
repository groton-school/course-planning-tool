import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import CoursePlan from '../Inventory/CoursePlans/CoursePlan';
import lib from '../lib';
import Role from '../Role';

export const pickStudent = () => 'c_ps';
global.c_ps = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: lib.Picker.allStudents(),
      message: 'Please choose a student for whom to create a course plan',
      actionName: 'Create Course Plan',
      callback: createPlanFor()
    },
    'Create Course Plan'
  );

const createPlanFor = () => 'c_cpf';
global.c_cpf = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.setMax(CoursePlan.stepCount.create);
  const plan = Inventory.CoursePlans.get(hostId);
  lib.Progress.setComplete({
    html: `<div>Created course plan for ${plan.student.getFormattedName()}.</div>
              <div><a id="button" class="btn btn-primary" onclick="google.script.host.close()" href="${plan.spreadsheet.getUrl()}" target="_blank">Open Plan</a></div>`
  });
};

export const pickForm = () => 'c_pf';
global.c_pf = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: lib.Picker.allForms(),
      message: 'Please choose a form for which to create course plans',
      actionName: 'Create Course Plans',
      callback: 'createAll'
    },
    'Create Course Plans'
  );

export const all = () => 'c_a';
global.c_a = (gradYear?: number, thread?: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  if (!gradYear) {
    lib.Progress.showModalDialog(SpreadsheetApp, 'Create Course Plans');
  }
  const students = gradYear
    ? Role.Student.getByForm(gradYear)
    : Role.Student.all();
  lib.Progress.setMax(students.length * CoursePlan.stepCount.create);
  students.forEach((student: Role.Student) => {
    Inventory.CoursePlans.get(student.hostId);
  });
  lib.Progress.setComplete(true);
};
