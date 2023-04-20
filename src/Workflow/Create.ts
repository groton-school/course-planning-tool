import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Role from '../Role';
import * as Picker from './Picker';

export const pickStudent = () => 'a';
global.a = () =>
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

const createPlanFor = () => 'b';
global.b = (hostId: string, thread: string) => {
  const progress = g.HtmlService.Element.Progress.bindTo(thread);
  progress.setMax(CoursePlan.getCreateStepCount());
  CoursePlan.setThread(thread);
  const plan = CoursePlan.getByHostId(hostId);
  progress.setComplete({
    html: `<div>Created course plan for ${plan
      .getStudent()
      .getFormattedName()}.</div>
              <div><a id="button" class="btn btn-primary" onclick="google.script.host.close()" href="${plan
        .getSpreadsheet()
        .getUrl()}" target="_blank">Open Plan</a></div>`
  });
};

export const pickForm = () => 'c';
global.c = () =>
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

export const all = () => 'd';
global.d = (gradYear?: number, thread?: string) => {
  thread = thread || Utilities.getUuid();
  const progress = g.HtmlService.Element.Progress.bindTo(thread);
  progress.reset();
  if (!gradYear) {
    progress.showModalDialog(SpreadsheetApp, 'Create Course Plans');
  }
  CoursePlan.setThread(thread);
  const students = gradYear
    ? Role.Student.getByForm(gradYear)
    : Role.Student.getAll();
  progress.setMax(students.length * CoursePlan.getCreateStepCount());
  students.forEach((student: Role.Student, i) => {
    progress.setValue(i + 1);
    CoursePlan.for(student);
  });
  progress.setComplete(true);
};
