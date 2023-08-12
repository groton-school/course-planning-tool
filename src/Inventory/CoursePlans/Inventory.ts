import g from '@battis/gas-lighter';
import semverLt from 'semver/functions/lt';
import CoursePlan from '../../CoursePlan';
import lib from '../../lib';
import Role from '../../Role';
import Base from '../Base';
import CoursePlanEntry from './CoursePlanEntry';

// TODO graduate seniors out of the inventories?
// TODO archive departed advisors
class Inventory extends Base.Inventory<CoursePlanEntry> {
  protected getter(spreadsheetId: string, hostId?: Base.Inventory.Key) {
    const entry = new CoursePlanEntry(
      this,
      CoursePlan.bindTo({ spreadsheetId, hostId }),
      hostId
    );
    if (!entry.meta.permissionsUpdated) {
      if (entry.meta.newAdvisor) {
        entry.plan.assignToCurrentAdvisor();
      }
      if (entry.meta.inactive) {
        entry.plan.makeInactive();
      }
    }
    return entry;
  }
  // added to Inventory by CoursePlan constructor directly
  protected creator(key: Base.Inventory.Key) {
    const student = Role.Student.getByHostId(key.toString());
    return new CoursePlanEntry(this, new CoursePlan(student), student.hostId);
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

  public refresh = (hostId: Base.Inventory.Key) => {
    this.get(hostId);
  };

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
