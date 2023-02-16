import { Terse } from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Role from '../Role';

export const Single = () => 'createSingle';
global.createSingle = () => {
    SpreadsheetApp.getUi().showModalDialog(
        Terse.HtmlService.createTemplateFromFile('templates/create', {
            thread: Utilities.getUuid(),
        }).setHeight(100),
        'Create Course Plan'
    );
};

global.createSingleFor = (hostId: string, thread: string) => {
    Terse.HtmlService.Element.Progress.reset(thread);
    CoursePlan.setThread(thread);
    const plan = CoursePlan.for(Role.Student.getByHostId(hostId));
    Terse.HtmlService.Element.Progress.setComplete(
        thread,
        plan.getSpreadsheet().getUrl()
    );
};

export const All = () => 'createAll';
global.createAll = () => {
    const thread = Utilities.getUuid();
    Terse.HtmlService.Element.Progress.reset(thread);
    CoursePlan.setThread(thread);
    const students = Role.Student.getAll();
    Terse.HtmlService.Element.Progress.setMax(thread, students.length);
    SpreadsheetApp.getUi().showModalDialog(
        Terse.HtmlService.createTemplateFromFile('templates/create-all', {
            thread,
        }).setHeight(100),
        'Create Course Plans'
    );
    students.forEach((student: Role.Student, i) => {
        Terse.HtmlService.Element.Progress.setValue(thread, i + 1);
        CoursePlan.for(student);
    });
    Terse.HtmlService.Element.Progress.setComplete(
        thread,
        'All course plans created'
    );
};
