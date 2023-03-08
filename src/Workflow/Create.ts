import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Role from '../Role';

export const Single = () => 'createSingle';
global.createSingle = () => {
    SpreadsheetApp.getUi().showModalDialog(
        g.HtmlService.createTemplateFromFile('templates/create', {
            thread: Utilities.getUuid(),
        }).setHeight(100),
        'Create Course Plan'
    );
};

global.createSingleFor = (hostId: string, thread: string) => {
    g.HtmlService.Element.Progress.reset(thread);
    g.HtmlService.Element.Progress.setMax(thread, CoursePlan.getStepCount());
    CoursePlan.setThread(thread);
    const plan = CoursePlan.for(Role.Student.getByHostId(hostId));
    g.HtmlService.Element.Progress.setComplete(
        thread,
        plan.getSpreadsheet().getUrl()
    );
};

export const ByForm = () => 'createByForm';
global.createByForm = () => {
    SpreadsheetApp.getUi().showModalDialog(
        g.HtmlService.createTemplateFromFile('templates/create-by-form', {
            thread: Utilities.getUuid(),
        }).setHeight(100),
        'Create Course Plans'
    );
};

export const All = () => 'createAll';
global.createAll = (gradYear?: number) => {
    const thread = Utilities.getUuid();
    g.HtmlService.Element.Progress.reset(thread);
    CoursePlan.setThread(thread);
    const students = gradYear
        ? Role.Student.getByForm(gradYear)
        : Role.Student.getAll();
    g.HtmlService.Element.Progress.setMax(
        thread,
        students.length * CoursePlan.getStepCount()
    );
    SpreadsheetApp.getUi().showModalDialog(
        g.HtmlService.Element.Progress.getHtmlOutput(thread),
        `Create Course Plans${gradYear ? ` (Class of ${gradYear})` : ''}`
    );
    students.forEach((student: Role.Student, i) => {
        g.HtmlService.Element.Progress.setValue(thread, i + 1);
        CoursePlan.for(student);
    });
    g.HtmlService.Element.Progress.setComplete(
        thread,
        'All course plans created'
    );
};
