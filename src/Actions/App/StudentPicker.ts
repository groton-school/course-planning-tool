import { Terse } from '@battis/google-apps-script-helpers';
import { SHEET_ADVISORS } from '../../Constants';
import CoursePlan from '../../CoursePlan';
import State from '../../State';
import Student from '../../Student';

export default class StudentPicker {
    public static card(): GoogleAppsScript.Card_Service.Card {
        const students = State.getDataSheet().getSheetByName(SHEET_ADVISORS);
        var dropdown = CardService.newSelectionInput()
            .setType(CardService.SelectionInputType.DROPDOWN)
            .setFieldName('email')
            .setTitle('Choose a student')
            .setOnChangeAction(
                Terse.CardService.newAction({ functionName: EmailChange })
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

        State.resetStudent();

        return Terse.CardService.newCard({
            header: 'Course Planning Mockup',
            widgets: [
                dropdown,
                Terse.CardService.newTextButton({
                    text: 'Mockup',
                    functionName: CoursePlan,
                }),
            ],
        });
    }

    public static handleEmailChange(event): void {
        State.setStudent(event.formInput.email);
    }
}

global.handler_app_studentPicker_emailChange = StudentPicker.handleEmailChange;
const EmailChange = 'handler_app_studentPicker_emailChange';
