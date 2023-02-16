import { Terse } from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import Student from '../Student';

global.action_update = () => {
    SpreadsheetApp.getUi().showModalDialog(
        Terse.HtmlService.createTemplateFromFile('templates/update', {
            thread: Utilities.getUuid(),
        }).setHeight(100),
        'Update Course Plan'
    );
};

global.helper_update_getAllStudents = Student.getAll;

global.helper_update_update = (hostId: string, thread: string) => {
    Terse.HtmlService.Element.Progress.reset(thread);
    CoursePlan.setThread(thread);
    const plan = CoursePlan.for(Student.getByHostId(hostId));
    plan.updateEnrollmentHistory();
    Terse.HtmlService.Element.Progress.setComplete(
        thread,
        plan.getSpreadsheet().getUrl()
    );
};

global.helper_update_getProgress = (thread: string) =>
    Terse.HtmlService.Element.Progress.getProgress(thread);

export const getFunctionName = () => 'action_update';
