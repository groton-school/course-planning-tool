import g from "@battis/gas-lighter";
import CoursePlan from "../CoursePlan";
import * as Role from '../Role';

export const Single = () => 'updateCourseListSingle';
global.updateCourseListSingle = () => {
    SpreadsheetApp.getUi().showModalDialog(g.HtmlService.createTemplateFromFile('templates/update-course-list', { thread: Utilities.getUuid() }).setHeight(100), 'Update Course List');
}

global.updateCourseListSingleFor = (hostId: string, thread: string) => {
    g.HtmlService.Element.Progress.reset(thread);
    CoursePlan.setThread(thread);
    const plan = CoursePlan.for(Role.Student.getByHostId(hostId));
    plan.updateCourseList();
    g.HtmlService.Element.Progress.setComplete(thread, {
        html: `<div>Updated course list for ${plan.getStudent().getFormattedName()}.</div>
            <div><a id="button" class="button action" href="${plan.getSpreadsheet().getUrl()}" target="_blank">Open Plan</a></div>`
    });
}
