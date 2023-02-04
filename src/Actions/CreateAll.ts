import Student from '../Student';
import CoursePlan from '../CoursePlan';
import { Terse } from '@battis/gas-lighter';

const me = 'create-all';

global.action_createAll = () => {
  Terse.HtmlService.Element.Progress.reset(me);
  const students = Student.getAll();
  Terse.HtmlService.Element.Progress.setMax(me, students.length);
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createTemplateFromFile('templates/create-all').evaluate(),
    //.setHeight(100),
    'Create Course Plans'
  );
  students.forEach((student: Student, i) => {
    Terse.HtmlService.Element.Progress.setValue(me, i + 1);
    Terse.HtmlService.Element.Progress.setStatus(
      me,
      `${student.getFormattedName()} (${i + 1} / ${students.length})`
    );
    CoursePlan.for(student);
  });
  Terse.HtmlService.Element.Progress.setComplete(me, true);
};

global.helper_createAll_progressBar =
  Terse.HtmlService.Element.Progress.getHtml.bind(null, me);

export default 'action_createAll';
