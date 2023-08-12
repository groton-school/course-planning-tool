import g from '@battis/gas-lighter';
import semverLt from 'semver/functions/lt';
import lib from '../../lib';
import Role from '../../Role';
import Base from '../Base';
import CoursePlan from './CoursePlan';

// TODO graduate seniors out of the inventories?
// TODO archive departed advisors
class Inventory extends Base.Inventory<CoursePlan> {
  protected getter(spreadsheetId: string, hostId: Base.Inventory.Key) {
    const plan = new CoursePlan(
      this,
      DriveApp.getFileById(spreadsheetId),
      hostId
    );
    if (!plan.meta.permissionsUpdated) {
      if (plan.meta.newAdvisor) {
        plan.assignToCurrentAdvisor();
      }
      if (plan.meta.inactive) {
        plan.makeInactive();
      }
    }
    return plan;
  }
  // added to Inventory by CoursePlan constructor directly
  protected creator(key: Base.Inventory.Key) {
    const student = Role.Student.getByHostId(key.toString());
    return new CoursePlan(this, student, student.hostId);
  }

  public getSpreadsheet = () => this.getSheet().getParent();

  /**
   * @deprecated use {@link Inventory.all()}
   */
  public getAll() {
    const entries = g.SpreadsheetApp.Value.getSheetDisplayValues(
      this.getSheet()
    );
    entries.shift(); // remove column headings
    return entries;
  }

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
