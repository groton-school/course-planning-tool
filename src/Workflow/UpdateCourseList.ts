import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Role from '../Role';

export const Single = () => 'updateCourseListSingle';
global.updateCourseListSingle = () => {
  SpreadsheetApp.getUi().showModalDialog(
    g.HtmlService.createTemplateFromFile('templates/update-course-list', {
      thread: Utilities.getUuid()
    }).setHeight(100),
    'Update Course List'
  );
};

global.updateCourseListSingleFor = (hostId: string, thread: string) => {
  g.HtmlService.Element.Progress.reset(thread);
  CoursePlan.setThread(thread);
  const plan = CoursePlan.for(Role.Student.getByHostId(hostId));
  plan.updateCourseList();
  g.HtmlService.Element.Progress.setComplete(thread, {
    html: `<div>Updated course list for ${plan
      .getStudent()
      .getFormattedName()}.</div>
            <div><a id="button" class="button action" onclick="google.script.host.close()" href="${plan
              .getSpreadsheet()
              .getUrl()}" target="_blank">Open Plan</a></div>`
  });
};

export const All = () => 'updateCourseListAll';
global.updateCourseListAll = () => {
  const thread = Utilities.getUuid();
  g.HtmlService.Element.Progress.reset(thread);
  CoursePlan.setThread(thread);
  const plans = CoursePlan.getAll().map(([hostId]) => hostId);
  g.HtmlService.Element.Progress.setMax(thread, plans.length * 2);
  SpreadsheetApp.getUi().showModalDialog(
    g.HtmlService.Element.Progress.getHtmlOutput(thread),
    'Update Course List'
  );
  plans.forEach((hostId) =>
    CoursePlan.for(Role.Student.getByHostId(hostId)).updateCourseList()
  );
  g.HtmlService.Element.Progress.setComplete(thread, true);
};
