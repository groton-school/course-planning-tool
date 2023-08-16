import MConfig from './Config';
import MCoursePlanningData from './CoursePlanningData';
import CoursePlanTemplate from './CoursePlanTemplate';
import currentSchoolYear from './currentSchoolYear';
import * as MFormat from './Format';
import MProgress from './Progress';

class lib {
  private constructor() {
    // static-only
  }

  public static CoursePlanTemplate = CoursePlanTemplate;

  public static currentSchoolYear = currentSchoolYear;
}

namespace lib {
  export import Config = MConfig;
  export import Format = MFormat;
  export import CoursePlanningData = MCoursePlanningData;
  export import Progress = MProgress;
}

export { lib as default };
