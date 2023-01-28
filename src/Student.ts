import Advisor from './Advisor';
import Constants from './Constants';
import CoursePlan from './CoursePlan';
import State from './State';

export default class Student {
    public hostId: string;
    public email: string;
    public firstName: string;
    public lastName: string;
    public gradYear: number;
    public abbrevGradYear: number;

    public constructor(data: object) {
        if (Array.isArray(data)) {
            const [hostId, email, firstName, lastName, gradYear] = data;
            data = { hostId, email, firstName, lastName, gradYear };
        }
        Object.assign(this, data);
        this.abbrevGradYear = this.gradYear - 2000;
    }

    public getFormattedName(): string {
        return `${this.firstName} ${this.lastName} ‘${this.gradYear - 2000}`;
    }

    public getAdvisor() {
        return Advisor.getByAdvisee(this.hostId);
    }

    public static getAll(): Student[] {
        const thisYear = CoursePlan.getCurrentSchoolYear();
        return State.getDataSheet()
            .getSheetByName(Constants.Spreadsheet.Sheet.ADVISORS)
            .getRange(Constants.Spreadsheet.A1Notation.STUDENT_DATA)
            .getValues()
            .slice(0, 4) // FIXME remove when testing complete
            .map((row) => new Student(row))
            .filter((student) => student.gradYear != thisYear); // filter out seniors
    }
}
