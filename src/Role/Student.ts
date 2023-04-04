import g from '@battis/gas-lighter';
import CoursePlan from '../CoursePlan';
import { Advisor } from './Advisor';

export class Student {
  private static data?: any[][];

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

  protected static getData() {
    if (!Student.data) {
      Student.data = g.SpreadsheetApp.Range.getEntireSheet(
        SpreadsheetApp.getActive().getSheetByName('Advisor List')
      ).getValues();
      Student.data.shift(); // strip column labels
    }
    return Student.data;
  }

  public static getByHostId = (id: string) =>
    Student.getData().reduce(
      (student: Student, [hostId, email, firstName, lastName, gradYear]) => {
        if (hostId == id) {
          return new Student({
            hostId,
            firstName,
            lastName,
            email,
            gradYear
          });
        }
        return student;
      },
      null
    );

  public getAdvisor = () => Advisor.getByAdvisee(this.hostId);

  public static getAll(): Student[] {
    const thisYear = CoursePlan.getCurrentSchoolYear();
    return Student.getData()
      .map((row) => new Student(row))
      .filter((student) => student.gradYear != thisYear);
  }

  public static getByForm(gradYear: number): Student[] {
    return Student.getAll().filter((student) => student.gradYear == gradYear);
  }

  public static getForms(): number[] {
    return Student.getData().reduce((forms, [, , , , gradYear]) => {
      if (!forms.includes(gradYear)) {
        forms.push(gradYear);
        forms.sort();
      }
      return forms;
    }, []);
  }
}

global.studentGetAll = Student.getAll;
global.studentGetForms = Student.getForms;
