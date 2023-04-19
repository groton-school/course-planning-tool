import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Role from '../Role';

export const allStudents = () => 's';
global.s = () =>
  Role.Student.getAll().map((student) => ({
    name: student.getFormattedName(),
    value: student.hostId
  }));

export const allForms = () => 't';
global.t = () =>
  [...new Set(Role.Student.getAll().map((student) => student.gradYear))]
    .sort()
    .map((year) => ({ name: `Class of ${year}`, value: year.toString() }));

export const allPlans = () => 'u';
global.u = () =>
  CoursePlan.getAll().map(
    ([hostId]): g.HtmlService.Element.Picker.Option => ({
      name: Role.Student.getByHostId(hostId).getFormattedName(),
      value: hostId
    })
  );
