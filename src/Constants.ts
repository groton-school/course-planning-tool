export default class Constants {
    public static readonly PREFIX = 'org.groton.CoursePlanningTool';
    public static readonly GRACE = 'GRACE';

    public static readonly Menu = class {
        public static readonly NAME = 'Course Planning';
        public static readonly Item = class {
            public static readonly MOCKUP = 'Mockup';
        };
    };

    public static readonly Spreadsheet = class {
        public static readonly Range = class {
            public static readonly HOST_ID = 'Enrollment_Host_ID';
            public static readonly TITLE = 'Enrollment_Title';
            public static readonly ORDER = 'Enrollment_Order';
            public static readonly DEPT = 'Enrollment_Department';
            public static readonly YEAR = 'Enrollment_Year';
        };

        public static readonly A1Notation = class {
            public static readonly NAMES = 'A1:A2';
            public static readonly YEARS = 'B5:G5';
            public static readonly ENROLLMENT_TOP_LEFT = 'B6';
        };

        public static readonly Sheet = class {
            public static readonly ADVISORS = 'Advisor List';
            public static readonly DEPTS = 'Courses by Department';
            public static readonly TEMPLATE = 'Template';
            public static readonly COURSE_PLAN = 'Course Plan';
            public static readonly PARAMETERS = 'Parameters';
            public static readonly FORM_FOLDER_INVENTORY = 'Form Folder Inventory';
        };
    };
}
