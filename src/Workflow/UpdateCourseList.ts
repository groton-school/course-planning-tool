import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Role from '../Role';

export const Single = () => 'updateCourseListSingle';
global.updateCourseListSingle = () => {
    SpreadsheetApp.getUi().showModalDialog(
        g.HtmlService.createTemplateFromFile('templates/plan-picker', {
            thread: Utilities.getUuid(),
            studentPicker: {
                message: 'Please choose a student for whom to update their course list',
                actionName: 'Update Course List',
                callback: updateSingleFor
            }
        }).setHeight(100),
        'Update Course List'
    );
};

const updateSingleFor = 'updateCourseListSingleFor';
global.updateCourseListSingleFor = (hostId: string, thread: string) => {
    g.HtmlService.Element.Progress.reset(thread);
    CoursePlan.setThread(thread);
    g.HtmlService.Element.Progress.setMax(
        thread,
        CoursePlan.getUpdateCourseListStepCount()
    );
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
    g.HtmlService.Element.Progress.setMax(
        thread,
        plans.length * CoursePlan.getUpdateCourseListStepCount()
    );
    SpreadsheetApp.getUi().showModalDialog(
        g.HtmlService.Element.Progress.getHtmlOutput(thread),
        'Update Course Lists'
    );
    plans.forEach((hostId) =>
        CoursePlan.for(Role.Student.getByHostId(hostId)).updateCourseList()
    );
    g.HtmlService.Element.Progress.setComplete(thread, true);
};
