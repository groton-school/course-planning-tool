import Constants from '../Constants';
import CoursePlan from '../CoursePlan';
import Student from '../Student';

class CreateAll {
    private static readonly TOTAL = `${Constants.PREFIX}.CreateAll.Total`;
    private static readonly CURRENT = `${Constants.PREFIX}.CreateAll.Current`;
    private static readonly PROGRESS = `${Constants.PREFIX}.CreateAll.Progress`;

    private static cache;

    public static dialog() {
        const students = Student.getAll();
        CreateAll.cache = CacheService.getUserCache();
        CreateAll.cache.put(CreateAll.TOTAL, JSON.stringify(students.length), 10);
        SpreadsheetApp.getUi().showModalDialog(
            HtmlService.createTemplateFromFile('templates/CreateAll').evaluate(),
            'Create All'
        );
        for (var i = 0; i < students.length; i++) {
            CreateAll.cache.put(
                CreateAll.CURRENT,
                students[i].getFormattedName(),
                10
            );
            CreateAll.cache.put(CreateAll.PROGRESS, JSON.stringify(i), 10);
            new CoursePlan(students[i]);
        }
    }

    public static getProgress() {
        return {
            total: CreateAll.cache.get(CreateAll.TOTAL),
            current: CreateAll.cache.get(CreateAll.CURRENT),
            progress: CreateAll.cache.get(CreateAll.PROGRESS),
        };
    }
}

global.action_createAll_dialog = CreateAll.dialog;
export const CreateAllDialog = 'action_createAll_dialog';

global.helper_createAll_getProgress = CreateAll.getProgress;
