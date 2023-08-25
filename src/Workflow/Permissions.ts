import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import lib from '../lib';

export const resetStudentFolderPermissions = () => 'p_rsfp';
global.p_rsfp = (thread = Utilities.getUuid(), step = 0) => {
  lib.Progress.setThread(thread);
  new g.HtmlService.Element.Progress.Paged(
    thread,
    { root: SpreadsheetApp, title: 'Reset Student Folder Permissions' },
    (step) => {
      const folders = Inventory.StudentFolders.all().filter(
        (folder) => folder.meta.active
      );
      lib.Progress.setMax(
        folders.length * parseInt(RESET_STUDENT_FOLDER_PERMISSIONS_STEPS)
      );
      return folders.slice(step);
    },
    (folder) => {
      try {
        folder.resetPermissions();
      } catch (error) {
        lib.Progress.log({
          message: `Error resetting permissions for student folder ${folder.id}`,
          error
        });
      }
    },
    resetStudentFolderPermissions(),
    step
  );
};

export const resetAdvisorFolderPermissions = () => 'p_rafp';
global.p_rafp = (thread = Utilities.getUuid(), step = 0) => {
  lib.Progress.setThread(thread);
  new g.HtmlService.Element.Progress.Paged(
    thread,
    { root: SpreadsheetApp, title: 'Reset Advisor Folder Permissions' },
    (step) => {
      const folders = Inventory.AdvisorFolders.all().filter(
        (folder) => folder.meta.active
      );
      lib.Progress.setMax(
        folders.length * parseInt(RESET_ADVISOR_FOLDER_PERMISSIONS_STEPS)
      );
      return folders.slice(step);
    },
    (folder) => {
      try {
        folder.resetPermissions();
      } catch (e) {
        lib.Progress.log(
          `Error resetting permissions for advisor folder ${folder.id}`
        );
      }
    },
    resetAdvisorFolderPermissions(),
    step
  );
};

export const resetCoursePlanPermissions = () => 'p_rcpp';
global.p_rcpp = (thread = Utilities.getUuid(), step = 0) => {
  lib.Progress.setThread(thread);
  new g.HtmlService.Element.Progress.Paged(
    thread,
    { root: SpreadsheetApp, title: 'Reset Course Plan permissions' },
    (step) => {
      const plans = Inventory.CoursePlans.all().filter(
        (plan) => plan.meta.active
      );
      lib.Progress.setMax(
        plans.length * parseInt(RESET_COURSE_PLAN_PERMISSIONS_STEPS)
      );
      return plans.slice(step);
    },
    (plan) => plan.resetPermissions(),
    resetCoursePlanPermissions(),
    step
  );
};

const listOfPlansToResetPermissions = () => 'p_loptrp';
const p_loptrp: g.HtmlService.Element.Picker.OptionsCallback = () =>
  Inventory.CoursePlans.all()
    .filter((plan) => plan.meta.active)
    .map((plan) => plan.toOption())
    .sort();
global.p_loptrp = p_loptrp;

export const pickPlanToResetPermissions = () => 'p_pptrp';
global.p_pptrp = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      message:
        'Please select a student for whpse course plan to reset permissions',
      actionName: 'Reset Permissions',
      callback: resetPermissionsFor(),
      list: listOfPlansToResetPermissions()
    },
    'Reset Course Plan Permissions'
  );

export const resetPermissionsFor = () => 'p_rpf';
global.p_rpf = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  lib.Progress.reset();
  const plan = Inventory.CoursePlans.get(hostId);
  lib.Progress.setStatus(plan.student.formattedName);
  plan.resetPermissions();
  lib.Progress.setCompleteLink({
    message: `Reset permissions for ${plan.student.formattedName}.`,
    url: plan.url
  });
};
