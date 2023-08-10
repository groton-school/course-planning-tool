import CoursePlan from '../../CoursePlan';
import Base from '../Base';
import Inventory from './Inventory';

class CoursePlanEntry extends Base.Item {
  public constructor(
    inventory: Inventory,
    plan: CoursePlan,
    hostId: Base.Inventory.Key
  ) {
    super(inventory, plan, hostId);
  }

  public get plan() {
    return this.content;
  }
}

namespace CoursePlanEntry { }

export { CoursePlanEntry as default };
