import lib from '../../lib';
import MCoursePlanEntry from './CoursePlanEntry';
import Inventory from './Inventory';
import MMetadata from './Metadata';

class CoursePlans extends Inventory {
  private static _instance: CoursePlans;
  public static getInstance(): CoursePlans {
    if (!this._instance) {
      this._instance = new CoursePlans(
        lib.CoursePlanningData.sheet.CoursePlanInventory
      );
    }
    return this._instance;
  }
}

namespace CoursePlans {
  export import CoursePlanEntry = MCoursePlanEntry;
  export import Metadata = MMetadata;
}

export { CoursePlans as default };
