import CoursePlan from '../../CoursePlan';
import Base from '../Base';
import Inventory from './Inventory';
import Metadata from './Metadata';

class CoursePlanEntry extends Base.Item {
  public constructor(
    inventory: Inventory,
    plan: CoursePlan,
    hostId: Base.Inventory.Key
  ) {
    super(inventory, plan, hostId);
  }

  public get plan(): CoursePlan {
    return this.content;
  }

  public meta = new Metadata(this.inventory as Inventory, this.key);
}

namespace CoursePlanEntry { }

export { CoursePlanEntry as default };
