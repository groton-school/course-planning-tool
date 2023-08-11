import g from '@battis/gas-lighter';
import CoursePlan from '../../CoursePlan';
import Role from '../../Role';
import Base from '../Base';
import CoursePlanEntry from './CoursePlanEntry';

// TODO graduate seniors out of the inventories?
// TODO archive departed advisors
class Inventory extends Base.Inventory<CoursePlanEntry> {
  protected getter(spreadsheetId: string, hostId?: Base.Inventory.Key) {
    return new CoursePlanEntry(
      this,
      CoursePlan.bindTo({ spreadsheetId, hostId }),
      hostId
    );
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
}

namespace Inventory { }

export { Inventory as default };
