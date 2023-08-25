import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
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
  lib.Progress.setMax(parseInt(CREATE_STEPS));
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
global.c_a = (thread = Utilities.getUuid(), step = 0, gradYear?: number) => {
  lib.Progress.setThread(thread);
  new g.HtmlService.Element.Progress.Paged(
    thread,
    { root: SpreadsheetApp, title: 'Create Course Plans' },
    (step) => {
      const students = gradYear
        ? Role.Student.getFormOf(gradYear).filter(
          (student) => !Inventory.CoursePlans.has(student.hostId)
        )
        : Role.Student.all().filter(
          (student) => !Inventory.CoursePlans.has(student.hostId)
        );
      lib.Progress.setMax(students.length * parseInt(CREATE_STEPS));
      return students.slice(step);
    },
    (student) => Inventory.CoursePlans.get(student.hostId),
    { function: all(), args: [gradYear] },
    step
  );
};
