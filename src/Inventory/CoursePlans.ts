import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import Role from '../Role';
import Inventory from './Inventory';

// TODO graduate seniors out of the inventories?
// TODO archive departed advisors
class CoursePlans extends Inventory<CoursePlan> {
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

  public metadataFor(hostId: Inventory.Key) {
    return new Metadata(this, hostId);
  }
}

class Metadata extends Inventory.Metadata<CoursePlan> {
  public get numOptionsPerDepartment() {
    return this.inventory.getMetadata(this.k, 14);
  }

  public set numOptionsPerDepartment(numOptionsPerDepartment: number) {
    this.inventory.setMetadata(this.k, 14, numOptionsPerDepartment);
  }

  public get numComments() {
    return this.inventory.getMetadata(this.k, 15);
  }

  public set numComments(numComments: number) {
    this.inventory.setMetadata(this.k, 15, numComments);
  }

  public get newAdvisor() {
    return this.inventory.getMetadata(this.k, 17);
  }

  public get permissionsUpdated() {
    return this.inventory.getMetadata(this.k, 18);
  }

  public set permissionsUpdated(permissionsUpdated: boolean) {
    this.inventory.setMetadata(this.k, 18, permissionsUpdated);
  }

  public get version() {
    return this.inventory.getMetadata(this.k, 19);
  }

  public set version(version: string) {
    this.inventory.setMetadata(this.k, 19, version);
  }
}

namespace CoursePlans { }

export { CoursePlans as default };
