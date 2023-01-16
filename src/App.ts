import { Terse } from '@battis/google-apps-script-helpers';
import Student from './Student';

export default class App {
    private static readonly PROP_DATA = 'DATA';
    public static readonly PROP_STUDENT = 'student';

    public static readonly SHEET_ADVISORS = 'Advisor List';
    public static readonly SHEET_ENROLLMENTS = 'Historical Enrollment';

    private static data: GoogleAppsScript.Spreadsheet.Spreadsheet = null;

    public static launch() {
        this.data = Terse.PropertiesService.getScriptProperty(
            App.PROP_DATA,
            SpreadsheetApp.openById
        );
        if (SpreadsheetApp.getActive().getId() != this.data.getId()) {
            return this.cards.error();
        }
        return this.cards.studentPicker();
    }

    public static handlers = class {
        public static emailChange(event): void {
            Terse.PropertiesService.setUserProperty(
                App.PROP_STUDENT,
                event.formInput.email
            );
        }
    };

    public static actions = class {
        public static home(): GoogleAppsScript.Card_Service.ActionResponse {
            return Terse.CardService.replaceStack(App.launch());
        }
    };

    public static cards = class {
        public static studentPicker(): GoogleAppsScript.Card_Service.Card {
            const students = App.data.getSheetByName(App.SHEET_ADVISORS);
            var dropdown = CardService.newSelectionInput()
                .setType(CardService.SelectionInputType.DROPDOWN)
                .setFieldName('email')
                .setTitle('Choose a student')
                .setOnChangeAction(
                    Terse.CardService.newAction('__App_handlers_emailChange')
                )
                .addItem(' ', null, true);
            for (const row of students.getRange('A2:E').getValues()) {
                const student = new Student(row);
                if (student.hostId) {
                    dropdown = dropdown.addItem(
                        student.getFormattedName(),
                        JSON.stringify(student),
                        false
                    );
                }
            }
            Terse.PropertiesService.deleteUserProperty('email');

            return CardService.newCardBuilder()
                .setHeader(Terse.CardService.newCardHeader('Course Planning Mockup'))
                .addSection(
                    CardService.newCardSection()
                        .addWidget(dropdown)
                        .addWidget(
                            Terse.CardService.newTextButton(
                                'Mockup',
                                '__CoursePlan_actions_mockup'
                            )
                        )
                )
                .build();
        }

        public static error(
            title = 'Error',
            message = null
        ): GoogleAppsScript.Card_Service.Card {
            return CardService.newCardBuilder()
                .setHeader(Terse.CardService.newCardHeader(title))
                .addSection(
                    CardService.newCardSection()
                        .addWidget(Terse.CardService.newTextParagraph(message || ' '))
                        .addWidget(
                            Terse.CardService.newTextButton('OK', '__App_actions_home')
                        )
                )
                .build();
        }
    };
}
