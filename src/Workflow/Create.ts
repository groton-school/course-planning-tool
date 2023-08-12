import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import Role from '../Role';
import * as Picker from './Picker';

export const pickStudent = () => 'c_ps';
global.c_ps = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: Picker.allStudents(),
      message: 'Please choose a student for whom to create a course plan',
      actionName: 'Create Course Plan',
      callback: createPlanFor()
    },
    'Create Course Plan'
  );

const createPlanFor = () => 'c_cpf';
global.c_cpf = (hostId: string, thread: string) => {
  const progress = g.HtmlService.Element.Progress.bindTo(thread);
  progress.setMax(CoursePlan.stepCount.create);
  CoursePlan.thread = thread;
  const plan = CoursePlan.for(hostId);
  progress.setComplete({
    html: `<div>Created course plan for ${plan.student.getFormattedName()}.</div>
              <div><a id="button" class="btn btn-primary" onclick="google.script.host.close()" href="${plan.spreadsheet.getUrl()}" target="_blank">Open Plan</a></div>`
  });
};

export const pickForm = () => 'c_pf';
global.c_pf = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: Picker.allForms(),
      message: 'Please choose a form for which to create course plans',
      actionName: 'Create Course Plans',
      callback: 'createAll'
    },
    'Create Course Plans'
  );

export const all = () => 'c_a';
global.c_a = (gradYear?: number, thread?: string) => {
  thread = thread || Utilities.getUuid();
  const progress = g.HtmlService.Element.Progress.bindTo(thread);
  progress.reset();
  if (!gradYear) {
    progress.showModalDialog(SpreadsheetApp, 'Create Course Plans');
  }
  CoursePlan.thread = thread;
  const students = gradYear
    ? Role.Student.getByForm(gradYear)
    : Role.Student.getAll();
  progress.setMax(students.length * CoursePlan.stepCount.create);
  students.forEach((student: Role.Student, i) => {
    progress.setValue(i + 1);
    CoursePlan.for(student);
  });
  progress.setComplete(true);
};
