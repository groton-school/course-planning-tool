import g from '@battis/gas-lighter';
import CoursePlan from '../../CoursePlan';
import Role from '../../Role';
import Base from '../Base';
import CoursePlanEntry from './CoursePlanEntry';
import Metadata from './Metadata';

// TODO graduate seniors out of the inventories?
// TODO archive departed advisors
class Inventory extends Base.Inventory<CoursePlanEntry> {
  protected getter(id: string, key?: Base.Inventory.Key) {
    return new CoursePlanEntry(this, CoursePlan.bindTo(id, key), key);
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

  public metadataFor(hostId: Base.Inventory.Key) {
    return new Metadata(this, hostId);
  }
}

namespace Inventory { }

export { Inventory as default };
