import { Terse } from '@battis/google-apps-script-helpers';
import { Mockup } from '../CoursePlan';
import State from '../State';
import Student from '../Student';

export default class StudentPicker {
    public static card(): GoogleAppsScript.Card_Service.Card {
        var dropdown = CardService.newSelectionInput()
            .setType(CardService.SelectionInputType.DROPDOWN)
            .setFieldName('email')
            .setTitle('Choose a student')
            .setOnChangeAction(
                Terse.CardService.newAction({ functionName: EmailChange })
            )
            .addItem(' ', null, true);
        for (const student of Student.getAll()) {
            if (student.hostId) {
                dropdown = dropdown.addItem(
                    student.getFormattedName(),
                    JSON.stringify(student),
                    false
                );
            }
        }

        State.resetStudent();

        return Terse.CardService.newCard({
            header: 'Course Planning Mockup',
            widgets: [
                dropdown,
                Terse.CardService.newTextButton({
                    text: 'Mockup',
                    functionName: Mockup,
                }),
            ],
        });
    }

    public static dialog() {
        SpreadsheetApp.getUi().showModalDialog(
            HtmlService.createTemplateFromFile('templates/StudentPicker').evaluate(),
            'Student Picker'
        );
    }

    public static handleEmailChange(event): void {
        State.setStudent(event.formInput.email);
    }
}

global.handler_app_studentPicker_emailChange = StudentPicker.handleEmailChange;
const EmailChange = 'handler_app_studentPicker_emailChange';

global.action_studentPicker_dialog = StudentPicker.dialog;
export const StudentPickerDialog = 'action_studentPicker_dialog';

global.helper_studentPicker_getAllStudents = Student.getAll;
