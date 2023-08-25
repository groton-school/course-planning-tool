import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import lib from '../lib';

const plansWithNewAdvisor = () => 'atca_pwna';
const atca_pwna: g.HtmlService.Element.Picker.OptionsCallback = () =>
  Inventory.CoursePlans.all()
    .filter((p) => p.meta.newAdvisor && !p.meta.permissionsUpdated)
    .map((p) => p.toOption());
global.atca_pwna = atca_pwna;

export const pickStudent = () => 'atca_ps';
global.atca_ps = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      message: 'Please select a student to re-assign to their current advisor',
      list: plansWithNewAdvisor(),
      callback: assignStudent(),
      actionName: 'Assign'
    },
    'Assign to Current Advisor'
  );

const assignStudent = () => 'atca_as';
global.atca_as = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  lib.Progress.setMax(parseInt(ASSIGN_TO_CURRENT_ADVISOR_STEPS));
  const plan = Inventory.CoursePlans.get(hostId);
  plan.assignToCurrentAdvisor();
  lib.Progress.setCompleteLink({
    message: `Assigned course plan for ${plan.student.formattedName} to ${plan.advisor?.formattedName}.`,
    url: {
      'Open Plan': plan.url,
      'Open Student Folder': plan.student.folder.url,
      'Open Advisor Folder': plan.advisor.folder?.url
    }
  });
};

export const all = () => 'acta_a';
global.acta_a = (thread = Utilities.getUuid(), step = 0) => {
  lib.Progress.setThread(thread);
  new g.HtmlService.Element.Progress.Paged(
    thread,
    { root: SpreadsheetApp, title: 'Assign to Current Advisors' },
    (step) => {
      const plans = Inventory.CoursePlans.all().filter(
        (plan) => plan.meta.active && !plan.meta.permissionsUpdated
      );
      lib.Progress.setMax(
        plans.length * parseInt(ASSIGN_TO_CURRENT_ADVISOR_STEPS)
      );
      return plans.slice(step);
    },
    (plan) => plan.assignToCurrentAdvisor(),
    all(),
    step
  );
};
