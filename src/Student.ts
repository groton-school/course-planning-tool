import Advisor from './Advisor';
import CoursePlan from './CoursePlan';

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

    public getFormattedName = () =>
        `${this.firstName} ${this.lastName} ‘${this.gradYear - 2000}`;

    public static getByHostId = (id: string) =>
        SpreadsheetApp.getActive()
            .getSheetByName('Advisor List')
            .getRange('AdvisorList_StudentData')
            .getValues()
            .reduce(
                (student: Student, [hostId, email, firstName, lastName, gradYear]) => {
                    if (hostId == id) {
                        return new Student({
                            hostId,
                            firstName,
                            lastName,
                            email,
                            gradYear,
                        });
                    }
                    return student;
                },
                null
            );

    public getAdvisor = () => Advisor.getByAdvisee(this.hostId);

    public static getAll(): Student[] {
        const thisYear = CoursePlan.getCurrentSchoolYear();
        return SpreadsheetApp.getActive()
            .getSheetByName('Advisor List')
            .getRange('AdvisorList_StudentData')
            .getValues()
            .slice(0, 10) // FIXME remove when testing complete
            .map((row) => new Student(row))
            .filter((student) => student.gradYear != thisYear); // TODO confirm filtering out seniors
    }
}
