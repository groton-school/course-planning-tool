import Constants from '../Constants';
import Inventory from '../Inventory';
import Student from '../Student';

type Progress = { max: number; value?: number; current?: string };

class CreateAll {
  private static readonly PROGRESS = `${Constants.PREFIX}.CreateAll.Progress`;

  private static coursePlanInventory?: Inventory;
  private static cache?: GoogleAppsScript.Cache.Cache;

  private static getCache() {
    if (!CreateAll.cache) {
      CreateAll.cache = CacheService.getUserCache();
    }
    return CreateAll.cache;
  }

  private static getCoursePlan(student: Student) {
    if (!this.coursePlanInventory) {
      this.coursePlanInventory = new Inventory(
        Constants.Spreadsheet.Sheet.COURSE_PLAN_INVENTORY
      );
    }
    return this.coursePlanInventory.getCoursePlan(student);
  }

  public static dialog() {
    const students = Student.getAll();
    const progress: Progress = { max: students.length };
    SpreadsheetApp.getUi().showModalDialog(
      HtmlService.createTemplateFromFile('templates/CreateAll')
        .evaluate()
        .setHeight(70),
      'Create All'
    );
    students.forEach((student: Student, i) => {
      CreateAll.putProgress({
        ...progress,
        value: i + 1,
        current: student.getFormattedName(),
      });
      CreateAll.getCoursePlan(student);
    });
  }

  private static putProgress(progress: Progress) {
    CreateAll.getCache().put(CreateAll.PROGRESS, JSON.stringify(progress), 60);
  }

  public static getProgress() {
    return JSON.parse(CreateAll.getCache().get(CreateAll.PROGRESS));
  }
}

global.action_createAll_dialog = CreateAll.dialog;
export const CreateAllDialog = 'action_createAll_dialog';

global.helper_createAll_getProgress = CreateAll.getProgress;
