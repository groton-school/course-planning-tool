export default class Constants {
    public static readonly PREFIX = 'org.groton.CoursePlanning';
    public static readonly GRACE = 'GRACE';
    public static readonly COMMENTORS = [
        'Comments from Faculty Advisor',
        'Comments from Studies Committee',
        'Comments from College Counseling Office',
    ];

    public static readonly ScriptProperties = class {
        public static readonly DATA = 'DATA';
        public static readonly TEMPLATE = 'TEMPLATE';
    };

    public static readonly FolderInventory = class {
        public static readonly ROOT = 'ROOT';
    };

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
            public static readonly DEPT_COURSE_LIST = 'A2:A';
            public static readonly NUM_OPTIONS_PER_DEPT = 'B1';
            public static readonly NUM_COMMENTS = 'B2';
            public static readonly FORM_FOLDER_NAME_FORMAT = 'B3';
            public static readonly ADVISOR_FOLDER_NAME_FORMAT = 'B4';
            public static readonly COURSE_PLAN_NAME_FORMAT = 'B5';
            public static readonly STUDIES_COMMITTEE = 'C2:C';
            public static readonly COLLEGE_COUNSELING = 'D2:D';
        };

        public static readonly Sheet = class {
            public static readonly ADVISORS = 'Advisor List';
            public static readonly COURSES = 'Courses by Department';
            public static readonly TEMPLATE = 'Template';
            public static readonly COURSE_PLAN = 'Course Plan';
            public static readonly PARAMETERS = 'Parameters';
            public static readonly FORM_FOLDER_INVENTORY = 'Form Folder Inventory';
            public static readonly ADVISOR_FOLDER_INVENTORY =
                'Advisor Folder Inventory';
        };
    };
}
