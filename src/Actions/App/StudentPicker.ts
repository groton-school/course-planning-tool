import { Terse } from '@battis/google-apps-script-helpers';
import { PROP_STUDENT, SHEET_ADVISORS } from '../../Constants';
import CoursePlan from '../../CoursePlan';
import State from '../../State';
import Student from '../../Student';

export function studentPickerCard(): GoogleAppsScript.Card_Service.Card {
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
    Terse.PropertiesService.deleteUserProperty('email');

    return CardService.newCardBuilder()
        .setHeader(Terse.CardService.newCardHeader('Course Planning Mockup'))
        .addSection(
            CardService.newCardSection()
                .addWidget(dropdown)
                .addWidget(
                    Terse.CardService.newTextButton({
                        text: 'Mockup',
                        functionName: CoursePlan,
                    })
                )
        )
        .build();
}

export function handleEmailChange(event): void {
    Terse.PropertiesService.setUserProperty(PROP_STUDENT, event.formInput.email);
}

global.handler_app_studentPicker_emailChange = handleEmailChange;
const EmailChange = 'handler_app_studentPicker_emailChange';
