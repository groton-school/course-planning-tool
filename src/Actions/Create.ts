import CoursePlan from '../CoursePlan';
import Student from '../Student';
import State from '../State';

global.action_create = () => {
  State.resetComplete();
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createTemplateFromFile('templates/create')
      .evaluate()
      .setHeight(100),
    'Create Course Plan'
  );
};

global.helper_create_getAllStudents = Student.getAll;

global.helper_create_create = (hostId: string) => {
  State.setComplete(CoursePlan.for(Student.getByHostId(hostId)).getUrl());
};

global.helper_create_progress = () => {
  return { progress: State.getProgress(), complete: State.getComplete() };
};

export default 'action_create';
