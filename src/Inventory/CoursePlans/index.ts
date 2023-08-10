import MCoursePlanEntry from './CoursePlanEntry';
import Inventory from './Inventory';
import MMetadata from './Metadata';

class CoursePlans extends Inventory { }

namespace CoursePlans {
  export import CoursePlanEntry = MCoursePlanEntry;
  export import Metadata = MMetadata;
}

export { CoursePlans as default };
