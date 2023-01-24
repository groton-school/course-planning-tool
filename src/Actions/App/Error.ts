import { Terse } from '@battis/google-apps-script-helpers';

export function errorCard(
    title = 'Error',
    message = null
): GoogleAppsScript.Card_Service.Card {
    return CardService.newCardBuilder()
        .setHeader(Terse.CardService.newCardHeader(title))
        .addSection(
            CardService.newCardSection()
                .addWidget(Terse.CardService.newTextParagraph(message || ' '))
                .addWidget(
                    Terse.CardService.newTextButton({
                        text: 'OK',
                        functionName: '__App_actions_home',
                    })
                )
        )
        .build();
}

export function errorAction(title?, message?) {
    return Terse.CardService.replaceStack(errorCard(title, message));
}

global.action_app_error = errorAction;
export default 'action_app_error';
