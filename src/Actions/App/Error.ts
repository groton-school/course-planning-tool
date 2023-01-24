import { Terse } from '@battis/google-apps-script-helpers';
import State from '../../State';
import Home from './Home';

export function errorCard(
    title = 'Error',
    message = null
): GoogleAppsScript.Card_Service.Card {
    return Terse.CardService.newCard({
        header: title,
        widgets: [
            Terse.CardService.newTextParagraph(message || ' '),
            Terse.CardService.newDecoratedText({
                topLabel: 'State',
                text: State.toJSON(),
            }),
            Terse.CardService.newTextButton({
                text: 'OK',
                functionName: Home,
            }),
        ],
    });
}

export function errorAction(title?, message?) {
    return Terse.CardService.replaceStack(errorCard(title, message));
}

global.action_app_error = errorAction;
export default 'action_app_error';
