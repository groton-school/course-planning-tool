import Student from '../Student';
import CoursePlan from '../CoursePlan';
import State from '../State';

type Progress = {
  max: number;
  value?: number;
  current?: string;
  progress?: string;
};

global.action_createAll = () => {
  State.resetComplete();
  const students = Student.getAll();
  const progress: Progress = { max: students.length };
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createTemplateFromFile('templates/create-all')
      .evaluate()
      .setHeight(100),
    'Create Course Plans'
  );
  students.forEach((student: Student, i) => {
    State.setProgress({
      ...progress,
      value: i + 1,
      current: student.getFormattedName(),
      progress: State.getProgress(),
    });
    CoursePlan.for(student);
  });
  State.setComplete('All course plans created');
};

global.helper_createAll_getProgress = () => {
  return { progress: State.getProgress(), complete: State.getComplete() };
};

export default 'action_createAll';
