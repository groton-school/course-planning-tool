import MCoursePlan from './CoursePlan';
import MInventory from './Inventory';
import MMetadata from './Metadata';

namespace CoursePlans {
  export import Inventory = MInventory;
  export import CoursePlan = MCoursePlan;
  export import Metadata = MMetadata;
}

export default CoursePlans;
