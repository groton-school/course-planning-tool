/** global: SpreadsheetApp, TersePropertiesService, CoursePlan, CardService, TerseCardService */

const App = {
  data: null,

  launch() {
    App.data = TersePropertiesService.getScriptProperty('DATA', SpreadsheetApp.openById);
    if (SpreadsheetApp.getActive().getId() != App.data.getId()) {
      return App.cards.error();
    }
    return App.cards.studentPicker();
  },

  handlers: {
    emailChange(event) {
      TersePropertiesService.setUserProperty('email', event.formInput.email);
    }
  },

  actions: {
    home() {
      return TerseCardService.replaceStack(App.cards.studentPicker());
    }
  },

  cards: {
    studentPicker() {
      const students = App.data.getSheetByName('Advisor List');
      var dropdown = CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setFieldName('email')
        .setTitle('Choose a student')
        .setOnChangeAction(TerseCardService.newAction('__App_handlers_emailChange'))
        .addItem(' ', null, true);
      for (const row of students.getRange('A2:E').getValues()) {
        if (row[0]) {
          dropdown = dropdown.addItem(`${row[2]} ${row[3]} ’${row[4] - 2000}`, row[1], false);
        }
      }
      TersePropertiesService.deleteUserProperty('email');

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
          .addWidget(TerseCardService.newTextButton('OK', '__App_actions_home')))
        .build();
    }
  }
}

function __App_launch(...args) {
  return App.launch(...args);
}

function __App_handlers_emailChange(...args) {
  return App.handlers.emailChange(...args);
}

function __App_actions_home(...args) {
  return App.actions.home(...args);
}
