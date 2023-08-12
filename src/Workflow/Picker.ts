import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import Role from '../Role';

export const allStudents = () => 'd_dpf';
global.p_as = () =>
  Role.Student.getAll().map((student) => ({
    name: student.getFormattedName(),
    value: student.hostId
  }));

export const allForms = () => 'p_af';
global.p_af = () =>
  [...new Set(Role.Student.getAll().map((student) => student.gradYear))]
    .sort()
    .map((year) => ({ name: `Class of ${year}`, value: year.toString() }));

export const allPlans = () => 'p_ap';
global.p_ap = () =>
  Inventory.CoursePlans.getAll().map(
    ([
      hostId,
      ,
      ,
      ,
      firstName,
      lastName,
      gradYear
    ]): g.HtmlService.Element.Picker.Option => ({
      name: new Role.Student({
        hostId,
        firstName,
        lastName,
        gradYear
      }).getFormattedName(),
      value: hostId
    })
  );
