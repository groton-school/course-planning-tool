import { Terse } from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import Student from '../Student';

// TODO add confirmation dialog
global.action_createAll = () => {
    const thread = Utilities.getUuid();
    Terse.HtmlService.Element.Progress.reset(thread);
    CoursePlan.setThread(thread);
    const students = Student.getAll();
    Terse.HtmlService.Element.Progress.setMax(thread, students.length);
    SpreadsheetApp.getUi().showModalDialog(
        Terse.HtmlService.createTemplateFromFile('templates/create-all', {
            thread,
        }).setHeight(100),
        'Create Course Plans'
    );
    students.forEach((student: Student, i) => {
        Terse.HtmlService.Element.Progress.setValue(thread, i + 1);
        CoursePlan.for(student);
    });
    Terse.HtmlService.Element.Progress.setComplete(
        thread,
        'All course plans created'
    );
};

global.helper_createAll_getProgress = (thread: string) =>
    Terse.HtmlService.Element.Progress.getProgress(thread);

export const getFunctionName = () => 'action_createAll';
