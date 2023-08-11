import g from '@battis/gas-lighter';
import lib from '../lib';
import Advisor from './Advisor';

class Student {
  private static data?: any[][];

  public readonly hostId: string;
  public readonly email: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly gradYear: number;
  public readonly abbrevGradYear: number;

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
        SpreadsheetApp.getActive().getSheetByName(
          lib.CoursePlanningData.sheet.AdvisorList
        )
      ).getValues();
      Student.data.shift(); // strip column labels
    }
    return Student.data;
  }

  public static getByHostId(id: string) {
    const [hostId, email, firstName, lastName, gradYear] =
      Student.getData().find(([hostId]) => hostId == id) || [];
    return (
      hostId && new Student({ hostId, firstName, lastName, email, gradYear })
    );
  }

  public getAdvisor = (year = Advisor.ByYear.Current) =>
    Advisor.getByAdvisee(this.hostId, year);

  public static getAll(): Student[] {
    const thisYear = lib.currentSchoolYear();
    return Student.getData()
      .map((row) => new Student(row))
      .filter((student) => student.gradYear != thisYear);
  }

  public static getByForm(gradYear: number): Student[] {
    return Student.getData()
      .map((row) => new Student(row))
      .filter((student) => student.gradYear == gradYear);
  }

  public static getForms: g.HtmlService.Element.Picker.OptionsCallback = () => {
    return Student.getData()
      .reduce((forms, [, , , , gradYear]) => {
        if (!forms.includes(gradYear)) {
          forms.push(gradYear);
          forms.sort();
        }
        return forms;
      }, [])
      .map(
        (form): g.HtmlService.Element.Picker.Option => ({
          name: `Class of ${form}`,
          value: form.toString()
        })
      );
  };
}

namespace Student { }

export { Student as default };
