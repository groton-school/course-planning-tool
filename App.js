/** global: SpreadsheetApp, TersePropertiesService, CoursePlan, CardService, TerseCardService */

const App = {
  sheet: null,

  launch() {
    const data = TersePropertiesService.getScriptProperty('DATA', SpreadsheetApp.openById);
    if (SpreadsheetApp.getActive().getId() != data.getId()) {
      return App.cards.error();
    }
    App.sheet = data.getSheetByName('Mockup');
    if (!App.sheet) {
      App.sheet = data.insertSheet(0);
      App.sheet.setName('Mockup');
    }

    return App.cards.studentPicker();
  },

  handlers: {
    emailChange(event) {
      TersePropertiesService.setUserProperty('email', event.formInput.email);
    }
  },

  cards: {
    studentPicker() {
      App.sheet.getRange('A1').setValue("=SORT(UNIQUE('Historical Enrollment'!B2:E), 4, true, 3, true)");
      var dropdown = CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setFieldName('email')
        .setTitle('Choose a student')
        .setOnChangeAction(TerseCardService.newAction('__App_handlers_emailChange'));
      for (const row of App.sheet.getRange('A:E').getValues()) {
        if (row[0]) {
          dropdown = dropdown.addItem(`${row[2]} ${row[3]}`, row[0], false);
        }
      }
      TersePropertiesService.setUserProperty('email', App.sheet.getRange('A1').getValue());
      App.sheet.getRange('A1').setValue(null);

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
          .addWidget(TerseCardService.newTextParagraph(message || ' ')))
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
