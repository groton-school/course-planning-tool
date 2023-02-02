import { CreateAllDialog } from './Actions/CreateAll';
import { StudentPickerDialog } from './Actions/StudentPicker';

export default class Editor {
  public static onOpen(event) {
    SpreadsheetApp.getUi()
      .createMenu('Course Planning')
      .addItem('Create all course plans', CreateAllDialog)
      .addSeparator()
      .addItem('Mock up a single course plan…', StudentPickerDialog)
      .addToUi();
  }

  public static onInstall(event) {
    Editor.onOpen(event);
  }
}
