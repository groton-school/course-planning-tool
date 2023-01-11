/** global: CardService */

const TerseCardService = {
  replaceStack(card, url = null) {
    var action = CardService.newActionResponseBuilder().setNavigation(
      CardService.newNavigation().popToRoot().updateCard(card)
    );

    if (url) {
      action = action.setOpenLink(CardService.newOpenLink().setUrl(url));
    }

    return action.build();
  },

  pushCard(card, url = null) {
    var action = CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation()
        .pushCard(card));

    if (url) {
      action = action.setOpenLink(CardService.newOpenLink().setUrl(url));
    }

    return action.build();
  },

  newCardHeader(title) {
    return CardService.newCardHeader().setTitle(title);
  },

  newTextParagraph(text) {
    return CardService.newTextParagraph().setText(text);
  },

  newDecoratedText(topLabel = null, text, bottomLabel = null, wrap = true) {
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
  },

  newTextButton(text, functionName) {
    return CardService.newTextButton()
      .setText(text)
      .setOnClickAction(TerseCardService.newAction(functionName));
  },

  newAction(functionName, stateChange = null) {
    return CardService.newAction()
      .setFunctionName(functionName);
  },
};
