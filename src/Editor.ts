import CreateAll from './Actions/CreateAll';
import Create from './Actions/Create';
import DeleteAll from './Actions/DeleteAll';

export default class Editor {
  public static onOpen(event) {
    SpreadsheetApp.getUi()
      .createMenu('Course Planning')
      .addItem('Create all course plans', CreateAll)
      .addSeparator()
      .addItem('Create a single course plan…', Create)
      .addItem('Delete all course plans', DeleteAll)
      .addToUi();
  }

  public static onInstall(event) {
    Editor.onOpen(event);
  }
}
