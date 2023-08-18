import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import CoursePlan from '../Inventory/CoursePlans/CoursePlan';
import Role from '../Role';
import lib from '../lib';

export const pickStudent = () => 'c_ps';
global.c_ps = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: studentsWithoutCoursePlans(),
      message: 'Please choose a student for whom to create a course plan',
      actionName: 'Create Course Plan',
      callback: createPlanFor()
    },
    'Create Course Plan'
  );

const studentsWithoutCoursePlans = () => 'c_swcp';
const c_swcp: g.HtmlService.Element.Picker.OptionsCallback = () =>
  Role.Student.all()
    .filter((s) => !Inventory.CoursePlans.has(s.hostId))
    .map((s) => s.toOption());
global.c_swcp = c_swcp;

const createPlanFor = () => 'c_cpf';
global.c_cpf = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.setMax(CoursePlan.stepCount.create);
  const plan = Inventory.CoursePlans.get(hostId);
  lib.Progress.setCompleteLink({
    message: `Created course plan for ${plan.student.formattedName}.`,
    url: plan.url
  });
};

export const pickForm = () => 'c_pf';
global.c_pf = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      list: formList(),
      message: 'Please choose a form for which to create course plans',
      actionName: 'Create Course Plans',
      callback: 'createAll'
    },
    'Create Course Plans'
  );

const formList = () => 'c_fl';
const c_fl: g.HtmlService.Element.Picker.OptionsCallback = () =>
  Role.Student.forms().map((f) => f.toOption());
global.c_fl = c_fl;

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
