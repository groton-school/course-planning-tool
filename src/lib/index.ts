import MConfig from './config';
import MCoursePlanningData from './CoursePlanningData';
import CoursePlanTemplate from './CoursePlanTemplate';
import currentSchoolYear from './currentSchoolYear';
import * as MFormat from './format';

class lib {
  private constructor() {
    // static-only
  }

  public static CoursePlanTemplate = CoursePlanTemplate;

  public static currentSchoolYear = currentSchoolYear;
}

namespace lib {
  export import config = MConfig;
  export import format = MFormat;
  export import CoursePlanningData = MCoursePlanningData;
}

export { lib as default };
