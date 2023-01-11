class App {
  static readonly PROP_DATA = 'DATA';
  static readonly PROP_STUDENT = 'student';

  static readonly SHEET_ADVISORS = 'Advisor List';
  static readonly SHEET_ENROLLMENTS = 'Historical Enrollment';

  private static data: GoogleAppsScript.Spreadsheet.Spreadsheet = null;

  public static launch() {
    this.data = TersePropertiesService.getScriptProperty(App.PROP_DATA, SpreadsheetApp.openById);
    if (SpreadsheetApp.getActive().getId() != this.data.getId()) {
      return this.cards.error();
    }
    return this.cards.studentPicker();
  }

  public static handlers = class {
    public static emailChange(event): void {
      TersePropertiesService.setUserProperty(App.PROP_STUDENT, event.formInput.email);
    }
  }

  public static actions = class {
    public static home(): GoogleAppsScript.Card_Service.ActionResponse {
      return TerseCardService.replaceStack(App.launch());
    }
  }

  public static cards = class {
    public static studentPicker(): GoogleAppsScript.Card_Service.Card {
      const students = App.data.getSheetByName(App.SHEET_ADVISORS);
      var dropdown = CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setFieldName('email')
        .setTitle('Choose a student')
        .setOnChangeAction(TerseCardService.newAction('__App_handlers_emailChange'))
        .addItem(' ', null, true);
      for (const row of students.getRange('A2:E').getValues()) {
        const student = new Student(row);
        if (student.hostId) {
          dropdown = dropdown.addItem(student.getFormattedName(), JSON.stringify(student), false);
        }
      }
      TersePropertiesService.deleteUserProperty('email');

      return CardService.newCardBuilder()
        .setHeader(TerseCardService.newCardHeader('Course Planning Mockup'))
        .addSection(CardService.newCardSection()
          .addWidget(dropdown)
          .addWidget(TerseCardService.newTextButton('Mockup', '__CoursePlan_actions_mockup')))
        .build();
    }

    public static error(title = 'Error', message = null): GoogleAppsScript.Card_Service.Card {
      return CardService.newCardBuilder()
        .setHeader(TerseCardService.newCardHeader(title))
        .addSection(CardService.newCardSection()
          .addWidget(TerseCardService.newTextParagraph(message || ' '))
          .addWidget(TerseCardService.newTextButton('OK', '__App_actions_home')))
        .build();
    }
  }
}

function __App_launch() {
  return App.launch();
}

function __App_handlers_emailChange(event) {
  return App.handlers.emailChange(event);
}

function __App_actions_home() {
  return App.actions.home();
}
