import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Role from '../Role';
import Inventory, { Key as InventoryKey } from './Inventory';

// TODO graduate seniors out of the inventories?
// TODO archive departed advisors
export default class CoursePlanInventory extends Inventory<CoursePlan> {
  public static COL_HOST_ID = Inventory.COL_KEY;
  public static COL_COURSE_PLAN_ID = Inventory.COL_ID;
  public static COL_COURSE_PLAN_URL = Inventory.COL_URL;
  public static COL_STUDENT_EMAIL = 4;
  public static COL_STUDENT_LAST_NAME = 5;
  public static COL_STUDENT_FIRST_NAME = 6;
  public static COL_STUDENT_GRAD_YEAR = 7;
  public static COL_STUDENT_FOLDER_ID = 8;
  public static COL_ADVISOR_EMAIL = 9;
  public static COL_ADVISOR_FIRST_NAME = 10;
  public static COL_ADVISOR_LAST_NAME = 11;
  public static COL_ADVISOR_FOLDER_ID = 12;
  public static COL_FORM_FOLDER_ID = 13;
  public static COL_NUM_OPTIONS_PER_DEPT = 14;
  public static COL_NUM_COMMENTS = 15;

  protected getter = (id: string, key?: InventoryKey): CoursePlan =>
    CoursePlan.bindTo(id, key);

  // added to Inventory by CoursePlan constructor directly
  protected creator = (key: InventoryKey): CoursePlan =>
    new CoursePlan(Role.Student.getByHostId(key.toString()));

  public getAll() {
    const plans = g.SpreadsheetApp.Value.getSheetDisplayValues(this.getSheet());
    plans.shift(); // remove column headings
    return plans;
  }

  public getSpreadsheet = () => this.getSheet().getParent();
}
