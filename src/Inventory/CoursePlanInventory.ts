import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import * as Role from '../Role';
import Inventory, { Key as InventoryKey } from './Inventory';

// TODO graduate seniors out of the inventories?
// TODO archive departed advisors
export default class CoursePlanInventory extends Inventory<CoursePlan> {
  public static Columns = {
    ...Inventory.Columns,
    HostId: Inventory.Columns.Key,
    CoursePlanId: Inventory.Columns.Id,
    CoursePlanUrl: Inventory.Columns.Url,
    StudentEmail: 4,
    StudentLastName: 5,
    StudentFirstName: 6,
    StudentGradYear: 7,
    StudentFolderId: 8,
    AdvisorEmail: 9,
    AdvisorFirstName: 10,
    AdvisorLastName: 11,
    AdvisorFolderId: 12,
    FormFolderId: 13,
    NumOptionsPerDepartment: 14,
    NumComments: 15,
    Inactive: 16,
    NewAdvisor: 17,
    PermissionsUpdated: 18
  };

  protected getter = (id: string, key?: InventoryKey): CoursePlan =>
    CoursePlan.bindTo(id, key);

  // added to Inventory by CoursePlan constructor directly
  protected creator = (key: InventoryKey): CoursePlan =>
    new CoursePlan(Role.Student.getByHostId(key.toString()));

  public getSpreadsheet = () => this.getSheet().getParent();

  public getAll() {
    const entries = g.SpreadsheetApp.Value.getSheetDisplayValues(
      this.getSheet()
    );
    entries.shift(); // remove column headings
    return entries;
  }
}
