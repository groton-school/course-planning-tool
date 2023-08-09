import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import Role from '../Role';
import Inventory from './Inventory';

// TODO graduate seniors out of the inventories?
// TODO archive departed advisors
class CoursePlans extends Inventory<CoursePlan> {
  /* public Cols = {
    ...super.Cols,
    HostId: 1,
    CoursePlanId: 2,
    CoursePlanUrl: 3,
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
  }; */

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

  public getNumOptionsPerDepartment = (hostId: Inventory.Key) =>
    this.getMetadata(hostId, 14);
  public setNumOptionsPerDepartment = (hostId: Inventory.Key, value: number) =>
    this.setMetadata(hostId, 14, value);
  public getNumComments = (hostId: Inventory.Key) =>
    this.getMetadata(hostId, 15);
  public setNumComments = (hostId: Inventory.Key, value: number) =>
    this.setMetadata(hostId, 15, value);
  public getNewAdvisor = (hostId: Inventory.Key) =>
    this.getMetadata(hostId, 17);
  public getPermissionsUpdated = (hostId: Inventory.Key) =>
    this.getMetadata(hostId, 18);
  public setPermissionsUpdated = (hostId: Inventory.Key, value: boolean) =>
    this.setMetadata(hostId, 18, value);
}

namespace CoursePlans { }

export { CoursePlans as default };
