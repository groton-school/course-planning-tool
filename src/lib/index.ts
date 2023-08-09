import MConfig from './config';
import CoursePlanningData from './CoursePlanningData';
import CoursePlanTemplate from './CoursePlanTemplate';
import currentSchoolYear from './currentSchoolYear';
import * as MFormat from './format';

class lib {
  private constructor() {
    // static-only
  }

  public static CoursePlanningData = CoursePlanningData;
  public static CoursePlanTemplate = CoursePlanTemplate;

  public static currentSchoolYear = currentSchoolYear;
}

namespace lib {
  export import config = MConfig;
  export import format = MFormat;
}

export { lib as default };
