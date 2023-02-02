import Student from '../Student';

export default class StudentPicker {
  public static dialog() {
    SpreadsheetApp.getUi().showModalDialog(
      HtmlService.createTemplateFromFile('templates/StudentPicker')
        .evaluate()
        .setHeight(100),
      'Student Picker'
    );
  }
}

global.action_studentPicker_dialog = StudentPicker.dialog;
export const StudentPickerDialog = 'action_studentPicker_dialog';

global.helper_studentPicker_getAllStudents = Student.getAll;
