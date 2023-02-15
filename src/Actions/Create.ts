import { Terse } from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import Student from '../Student';

global.action_create = () => {
    SpreadsheetApp.getUi().showModalDialog(
        Terse.HtmlService.createTemplateFromFile('templates/create', {
            thread: Utilities.getUuid(),
        }).setHeight(100),
        'Create Course Plan'
    );
};

global.helper_create_getAllStudents = Student.getAll;

global.helper_create_create = (hostId: string, thread: string) => {
    Terse.HtmlService.Element.Progress.reset(thread);
    CoursePlan.setThread(thread);
    const plan = CoursePlan.for(Student.getByHostId(hostId));
    Terse.HtmlService.Element.Progress.setComplete(
        thread,
        plan.getSpreadsheet().getUrl()
    );
};

global.helper_create_getProgress = (thread) =>
    Terse.HtmlService.Element.Progress.getProgress(thread);

export default 'action_create';
