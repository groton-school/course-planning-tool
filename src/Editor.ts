import { CreateAllDialog } from './Actions/CreateAll';
import { StudentPickerDialog } from './Actions/StudentPicker';
import DeleteAll from './Actions/DeleteAll';

export default class Editor {
  public static onOpen(event) {
    SpreadsheetApp.getUi()
      .createMenu('Course Planning')
      .addItem('Create all course plans', CreateAllDialog)
      .addSeparator()
      .addItem('Mock up a single course plan…', StudentPickerDialog)
      .addItem('Delete all course plans', DeleteAll)
      .addToUi();
  }

  public static onInstall(event) {
    Editor.onOpen(event);
  }
}
