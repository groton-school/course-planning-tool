import { Terse } from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import Student from '../Student';

const P = Terse.HtmlService.Element.Progress.getInstance(
    CoursePlan.PROGRESS_KEY
);

// TODO add confirmation dialog
global.action_createAll = () => {
    P.reset();
    const students = Student.getAll();
    P.setMax(students.length);
    SpreadsheetApp.getUi().showModalDialog(
        HtmlService.createTemplateFromFile('templates/create-all')
            .evaluate()
            .setHeight(100),
        'Create Course Plans'
    );
    students.forEach((student: Student, i) => {
        P.setValue(i + 1);
        CoursePlan.for(student);
    });
    P.setComplete('All course plans created');
};

global.helper_createAll_getProgress = P.getProgress;

export default 'action_createAll';
