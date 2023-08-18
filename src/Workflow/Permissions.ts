import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import lib from '../lib';

export const resetStudentFolderPermissions = () => 'p_rsfp';
global.p_rsfp = () => {
  lib.Progress.reset();
  lib.Progress.showModalDialog(
    SpreadsheetApp,
    'Reset Student Folder Permissions'
  );
  const studentFolders = Inventory.StudentFolders.all();
  lib.Progress.setMax(studentFolders.length);
  studentFolders.forEach((folder) => {
    lib.Progress.setStatus(
      `Reset folder permissions on ${folder.driveFolder.getName()}`
    );
    try {
      folder.resetPermissions();
    } catch (e) {
      lib.Progress.log(
        `Error resetting permissions for student folder ${folder.id}`
      );
    }
  });
  lib.Progress.setComplete(true);
};

export const resetAdvisorFolderPermissions = () => 'p_rafp';
global.p_rafp = () => {
  lib.Progress.reset();
  lib.Progress.showModalDialog(
    SpreadsheetApp,
    'Reset Advisor Folder Permissions'
  );
  const advisorFolders = Inventory.AdvisorFolders.all();
  lib.Progress.setMax(advisorFolders.length);
  advisorFolders.forEach((folder) => {
    lib.Progress.setStatus(
      `Reset folder permissions on ${folder.driveFolder.getName()}`
    );
    try {
      folder.resetPermissions();
    } catch (e) {
      lib.Progress.log(
        `Error resetting permissions for advisor folder ${folder.id}`
      );
    }
  });
  lib.Progress.setComplete(true);
};

export const resetCoursePlanPermissions = () => 'p_rcpp';
global.p_rcpp = () => {
  lib.Progress.reset();
  lib.Progress.showModalDialog(SpreadsheetApp, 'Reset Course Plan Permissions');
  const plans = Inventory.CoursePlans.all();
  lib.Progress.setMax(
    plans.length *
    Inventory.Module.CoursePlans.CoursePlan.stepCount.resetPermissions
  );
  plans.forEach((plan) => {
    lib.Progress.setStatus(plan.student.formattedName);
    plan.resetPermissions();
  });
  lib.Progress.setComplete(true);
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
