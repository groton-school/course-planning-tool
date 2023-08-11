import g from '@battis/gas-lighter';
import CoursePlan from '../../CoursePlan';
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
    if (entry.meta.newAdvisor && !entry.meta.permissionsUpdated) {
      entry.plan.assignToCurrentAdvisor();
    } else if (entry.meta.inactive && !entry.meta.permissionsUpdated) {
      entry.plan.makeInactive();
    }
    return entry;
  }
  // added to Inventory by CoursePlan constructor directly
  protected creator(key: Base.Inventory.Key) {
    const student = Role.Student.getByHostId(key.toString());
    return new CoursePlanEntry(this, new CoursePlan(student), student.hostId);
  }

  public getSpreadsheet = () => this.getSheet().getParent();

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
}

namespace Inventory { }

export { Inventory as default };
