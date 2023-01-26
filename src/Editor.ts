import { StudentPickerDialog } from './Actions/StudentPicker';
import Constants from './Constants';

export default class Editor {
    public static onOpen(event) {
        SpreadsheetApp.getUi()
            .createMenu(Constants.Menu.NAME)
            .addItem(Constants.Menu.Item.MOCKUP, StudentPickerDialog)
            .addToUi();
    }

    public static onInstall(event) {
        Editor.onOpen(event);
    }
}
