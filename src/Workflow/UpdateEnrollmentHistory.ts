import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Role from '../Role';

export const Single = () => 'updateSingle';
global.updateSingle = () => {
  SpreadsheetApp.getUi().showModalDialog(
    g.HtmlService.createTemplateFromFile('templates/plan-picker', {
      thread: Utilities.getUuid(),
      studentPicker: {
        message:
          'Please choose a student for whom to update their enrollment history',
        actionName: 'Update Enrollment History',
        callback: updateSingleFor
      }
    }).setHeight(100),
    'Update Enrollment History'
  );
};

const updateSingleFor = 'updateEnrollmentHistorySingleFor';
global.updateEnrollmentHistorySingleFor = (hostId: string, thread: string) => {
  g.HtmlService.Element.Progress.reset(thread);
  g.HtmlService.Element.Progress.setMax(
    thread,
    CoursePlan.getUpdateEnrollmentHistoryStepCount()
  );
  CoursePlan.setThread(thread);
  const plan = CoursePlan.for(Role.Student.getByHostId(hostId));
  plan.updateEnrollmentHistory();
  g.HtmlService.Element.Progress.setComplete(thread, {
    html: `<div>Updated course plan for ${plan
      .getStudent()
      .getFormattedName()}.</div>
          <div><a id="button" class="button action" onclick="google.script.host.close()" href="${plan
        .getSpreadsheet()
        .getUrl()}" target="_blank">Open Plan</a></div>`
  });
};

export const All = () => 'updateEnrollmentHistoryAll';
global.updateEnrollmentHistoryAll = () => {
  const thread = Utilities.getUuid();
  g.HtmlService.Element.Progress.reset(thread);
  CoursePlan.setThread(thread);
  const plans = CoursePlan.getAll().map(([hostId]) => hostId);
  g.HtmlService.Element.Progress.setMax(
    thread,
    plans.length * CoursePlan.getUpdateEnrollmentHistoryStepCount()
  );
  SpreadsheetApp.getUi().showModalDialog(
    g.HtmlService.Element.Progress.getHtmlOutput(thread),
    'Update Enrollment Histories'
  );
  plans.forEach((hostId) =>
    CoursePlan.for(Role.Student.getByHostId(hostId)).updateEnrollmentHistory()
  );
  g.HtmlService.Element.Progress.setComplete(thread, true);
};
