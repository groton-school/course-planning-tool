import Inventory from '../Inventory';
import Role from '../Role';

const allStudents = () => 'd_dpf';
global.p_as = () =>
  Role.Student.all().map((student) => ({
    name: student.getFormattedName(),
    value: student.hostId
  }));

const allForms = () => 'p_af';
global.p_af = () =>
  Role.Student.getForms().map((year) => ({
    name: `Form of ${year}`,
    value: year.toString()
  }));

const allPlans = () => 'p_ap';
global.p_ap = () =>
  Inventory.CoursePlans.all()
    .filter((plan) => plan.meta.active)
    .map((plan) => ({
      name: plan.student.getFormattedName(),
      value: plan.hostId
    }));

export default { allStudents, allForms, allPlans };
