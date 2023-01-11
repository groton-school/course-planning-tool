/** global: SpreadsheetApp, PropertiesService, State, CoursePlan, CardService, TerseCardService */

const App = {

  launch() {
    const data = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('DATA'));
    if (SpreadsheetApp.getActive().getId() != data.getId()) {
      return App.cards.error();
    }
    var mockup = data.getSheetByName('Mockup');
    if (!mockup) {
      mockup = data.insertSheet(0);
      mockup.setName('Mockup');
    }
    State.setSheet(mockup);

    return App.cards.studentPicker();
  },

  handlers: {
    emailChange(event) {
      PropertiesService.getUserProperties().setProperty('email', event.formInput.email);
    }
  },

  cards: {
    studentPicker() {
      State.getSheet().getRange('A1').setValue("=SORT(UNIQUE('Historical Enrollment'!B2:E), 4, true, 3, true)");
      var dropdown = CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setFieldName('email')
        .setTitle('Choose a student')
        .setOnChangeAction(TerseCardService.newAction('__App_handlers_emailChange'));
      for (const row of State.getSheet().getRange('A:E').getValues()) {
        if (row[0]) {
          dropdown = dropdown.addItem(`${row[2]} ${row[3]}`, row[0], false);
        }
      }
      PropertiesService.getUserProperties().setProperty('email', State.getSheet().getRange('A1').getValue());
      State.getSheet().getRange('A1').setValue(null);

      return CardService.newCardBuilder()
        .setHeader(TerseCardService.newCardHeader('Course Planning Mockup'))
        .addSection(CardService.newCardSection()
          .addWidget(dropdown)
          .addWidget(TerseCardService.newTextButton('Mockup', '__CoursePlan_actions_mockup')))
        .build();
    },
    error(title = 'Error', message = null) {
      return CardService.newCardBuilder()
        .setHeader(TerseCardService.newCardHeader(title))
        .addSection(CardService.newCardSection()
          .addWidget(TerseCardService.newTextParagraph(message || ' '))
          .addWidget(TerseCardService.newDecoratedText('State', JSON.stringify(State, null, 2))))
        .build();
    }
  }
}

function __App_launch(event) {
  return App.launch(event);
}

function __App_handlers_emailChange(event) {
  return App.handlers.emailChange(event);
}
