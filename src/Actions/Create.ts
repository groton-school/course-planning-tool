import CoursePlan from '../CoursePlan';
import Student from '../Student';
import { Terse } from '@battis/gas-lighter';

const P = Terse.HtmlService.Element.Progress.getInstance(
  CoursePlan.PROGRESS_KEY
);

global.action_create = () => {
  P.reset();
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createTemplateFromFile('templates/create')
      .evaluate()
      .setHeight(100),
    'Create Course Plan'
  );
};

global.helper_create_getAllStudents = Student.getAll;

global.helper_create_create = (hostId: string) => {
  const plan = CoursePlan.for(Student.getByHostId(hostId));
  P.setComplete(plan.getUrl());
};

global.helper_create_getProgress = P.getProgress;

export default 'action_create';
