import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Role from '../Role';

export const CreateMissingStudentFolder = () =>
    'restructureCreateMissingStudentFolder';
global.restructureCreateMissingStudentFolder = () => {
    SpreadsheetApp.getUi().showModalDialog(
        g.HtmlService.createTemplateFromFile('templates/restructure', {
            thread: Utilities.getUuid(),
            studentPicker: {
                message:
                    'Please choose a student for whom to create their missing student folder',
                callback: 'restructureCreateMissingStudentFolderFor'
            }
        }).setHeight(100),
        'Create Missing Student Folder'
    );
};

global.restructureCreateMissingStudentFolderFor = (
    hostId: string,
    thread: string
) => {
    g.HtmlService.Element.Progress.reset(thread);
    CoursePlan.setThread(thread);
    CoursePlan.for(
        Role.Student.getByHostId(hostId)
    ).createStudentFolderIfMissing();
    g.HtmlService.Element.Progress.setComplete(thread, true);
};

export const CreateAllMissingStudentFolders = () =>
    'restructureCreateAllMissingStudentFolders';
global.restructureCreateAllMissingStudentFolders = () => {
    const thread = Utilities.getUuid();
    g.HtmlService.Element.Progress.reset(thread);
    CoursePlan.setThread(thread);
    const plans = CoursePlan.getAll().map(([hostId]) => hostId);
    g.HtmlService.Element.Progress.setMax(thread, plans.length * 4);
    SpreadsheetApp.getUi().showModalDialog(
        g.HtmlService.Element.Progress.getHtmlOutput(thread),
        'Create Missing Student Folders'
    );
    plans.forEach((hostId) =>
        CoursePlan.for(
            Role.Student.getByHostId(hostId)
        ).createStudentFolderIfMissing()
    );
    g.HtmlService.Element.Progress.setComplete(thread, true);
};
