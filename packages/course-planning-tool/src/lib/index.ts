import CoursePlanTemplate from './CoursePlanTemplate';
import MCoursePlanningData from './CoursePlanningData';
import * as MFormat from './Format';
import MParameters from './Parameters';
import MProgress from './Progress';
import currentSchoolYear from './currentSchoolYear';

class lib {
  private constructor() {
    // static-only
  }

  public static CoursePlanTemplate = CoursePlanTemplate;

  public static currentSchoolYear = currentSchoolYear;
}

namespace lib {
  export import Parameters = MParameters;
  export import Format = MFormat;
  export import CoursePlanningData = MCoursePlanningData;
  export import Progress = MProgress;
}

export { lib as default };
