import { Terse } from '@battis/google-apps-script-helpers';
import { PROP_DATA } from '../../Constants';
import State from '../../State';
import { errorCard } from './Error';
import { studentPickerCard } from './StudentPicker';

export function homeCard() {
    const data = Terse.PropertiesService.getScriptProperty(
        PROP_DATA,
        SpreadsheetApp.openById
    );
    if (State.getDataSheet() && State.getDataSheet().getId() != data.getId()) {
        return errorCard();
    }
    return studentPickerCard();
}

export function homeAction() {
    return Terse.CardService.replaceStack(homeCard());
}

global.action_app_home = homeAction;
export default 'action_app_home';