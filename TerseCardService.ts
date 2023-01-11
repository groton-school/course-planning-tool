class TerseCardService {
  public static replaceStack(card: GoogleAppsScript.Card_Service.Card, url: string = null): GoogleAppsScript.Card_Service.ActionResponse {
    var action = CardService.newActionResponseBuilder().setNavigation(
      CardService.newNavigation().popToRoot().updateCard(card)
    );

    if (url) {
      action = action.setOpenLink(CardService.newOpenLink().setUrl(url));
    }

    return action.build();
  }

  public static pushCard(card: GoogleAppsScript.Card_Service.Card, url = null): GoogleAppsScript.Card_Service.ActionResponse {
    var action = CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation()
        .pushCard(card));

    if (url) {
      action = action.setOpenLink(CardService.newOpenLink().setUrl(url));
    }

    return action.build();
  }

  public static newCardHeader(title): GoogleAppsScript.Card_Service.CardHeader {
    return CardService.newCardHeader().setTitle(title);
  }

  public static newTextParagraph(text: string): GoogleAppsScript.Card_Service.TextParagraph {
    return CardService.newTextParagraph().setText(text);
  }

  public static newDecoratedText(topLabel: string = null, text: string, bottomLabel: string = null, wrap: boolean = true): GoogleAppsScript.Card_Service.DecoratedText {
    var decoratedText = CardService.newDecoratedText().setText(text || " ");
    if (topLabel) {
      decoratedText = decoratedText.setTopLabel(topLabel);
    }
    if (text) {
      decoratedText = decoratedText.setWrapText(wrap);
    }
    if (bottomLabel) {
      decoratedText = decoratedText.setBottomLabel(bottomLabel);
    }
    return decoratedText;
  }

  public static newTextButton(text: string, functionName: string): GoogleAppsScript.Card_Service.TextButton {
    return CardService.newTextButton()
      .setText(text)
      .setOnClickAction(TerseCardService.newAction(functionName));
  }

  public static newAction(functionName: string): GoogleAppsScript.Card_Service.Action {
    return CardService.newAction()
      .setFunctionName(functionName);
  }
};
