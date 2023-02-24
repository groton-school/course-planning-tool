import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Role from '../Role';

export const Single = () => 'updateSingle';
global.updateSingle = () => {
    SpreadsheetApp.getUi().showModalDialog(
        g.HtmlService.createTemplateFromFile('templates/update', {
            thread: Utilities.getUuid(),
        }).setHeight(100),
        'Update Course Plan'
    );
};

global.updateSingleFor = (hostId: string, thread: string) => {
    g.HtmlService.Element.Progress.reset(thread);
    CoursePlan.setThread(thread);
    const plan = CoursePlan.for(Role.Student.getByHostId(hostId));
    plan.updateEnrollmentHistory();
    g.HtmlService.Element.Progress.setComplete(
        thread,
        plan.getSpreadsheet().getUrl()
    );
};

export const All = () => 'updateAll';
global.updateAll = () => {
    const thread = Utilities.getUuid();
    g.HtmlService.Element.Progress.reset(thread);
    CoursePlan.setThread(thread);
    const plans = CoursePlan.getAll().map(([hostId]) => hostId);
    g.HtmlService.Element.Progress.setMax(
        thread,
        plans.length * CoursePlan.getStepCount()
    );
    SpreadsheetApp.getUi().showModalDialog(
        g.HtmlService.Element.Progress.getHtmlOutput(thread),
        'Update Course Plans'
    );
    plans.forEach((hostId) =>
        CoursePlan.for(Role.Student.getByHostId(hostId)).updateEnrollmentHistory()
    );
    g.HtmlService.Element.Progress.setComplete(
        thread,
        'All course plans updated'
    );
};

// TODO add option to override comments with new enrollments?
