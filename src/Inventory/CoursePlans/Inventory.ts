import semverLt from 'semver/functions/lt';
import Role from '../../Role';
import lib from '../../lib';
import Base from '../Base';
import CoursePlan from './CoursePlan';

// TODO graduate seniors out of the inventories?
// TODO archive departed advisors
class Inventory extends Base.Inventory<CoursePlan> {
  private static _instance?: Inventory;
  public static getInstance(): Inventory {
    if (!this._instance) {
      this._instance = new Inventory();
    }
    return this._instance;
  }

  private constructor() {
    super(lib.CoursePlanningData.sheet.CoursePlanInventory);
  }

  protected getter(spreadsheetId: string, hostId: Base.Inventory.Key) {
    return new CoursePlan(this, spreadsheetId, hostId);
  }
  // added to Inventory by CoursePlan constructor directly
  protected creator(key: Base.Inventory.Key) {
    const student = Role.Student.get(key.toString());
    return new CoursePlan(this, student, student.hostId);
  }

  public getSpreadsheet = () => this.sheet.getParent();

  public get minVersion() {
    return this.data.reduce(
      (min: string, row) =>
        semverLt(row[lib.CoursePlanningData.column.CoursePlans.Version], min)
          ? row[lib.CoursePlanningData.column.CoursePlans.Version]
          : min,
      APP_VERSION
    );
  }
}

namespace Inventory { }

export { Inventory as default };
