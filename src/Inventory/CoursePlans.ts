import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import Role from '../Role';
import Inventory from './Inventory';

// TODO graduate seniors out of the inventories?
// TODO archive departed advisors
class CoursePlans extends Inventory<CoursePlan> {
  public Cols = {
    ...super.Cols,
    HostId: super.Cols.Key,
    CoursePlanId: super.Cols.Id,
    CoursePlanUrl: super.Cols.Url,
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

  protected getter = (id: string, key?: Inventory.Key): CoursePlan =>
    CoursePlan.bindTo(id, key);

  // added to Inventory by CoursePlan constructor directly
  protected creator = (key: Inventory.Key): CoursePlan =>
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

namespace CoursePlans { }

export { CoursePlans as default };
