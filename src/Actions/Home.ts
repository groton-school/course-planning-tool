import { Terse } from '@battis/google-apps-script-helpers';
import State from '../State';
import { errorCard } from './Error';
import StudentPicker from './StudentPicker';

export function homeCard() {
    const data = Terse.PropertiesService.getScriptProperty(
        'DATA',
        SpreadsheetApp.openById
    );
    if (State.getDataSheet() && State.getDataSheet().getId() != data.getId()) {
        return errorCard();
    }
    return StudentPicker.card();
}

export function homeAction() {
    return Terse.CardService.replaceStack(homeCard());
}

global.action_app_home = homeAction;
export default 'action_app_home';
