import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import CoursePlan from '../Inventory/CoursePlans/CoursePlan';
import StudentFolder from '../Inventory/StudentFolders/StudentFolder';
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
  public readonly newStudent: boolean;
  public readonly newAdvisor: boolean;

  private constructor(data: object) {
    if (Array.isArray(data)) {
      const [
        hostId,
        email,
        firstName,
        lastName,
        gradYear,
        newStudent,
        newAdvisor
      ] = data;
      data = {
        hostId,
        email,
        firstName,
        lastName,
        gradYear,
        newStudent,
        newAdvisor
      };
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
    const [
      hostId,
      email,
      firstName,
      lastName,
      gradYear,
      ,
      ,
      ,
      newStudent,
      newAdvisor
    ] = Student.getData().find(([hostId]) => hostId == id) || [];
    return (
      hostId &&
      new Student({
        hostId,
        firstName,
        lastName,
        email,
        gradYear,
        newStudent,
        newAdvisor
      })
    );
  }

  private _plan?: CoursePlan;
  public get plan() {
    if (!this._plan) {
      this._plan = Inventory.CoursePlans.get(this.hostId);
    }
    return this._plan;
  }

  private _folder?: StudentFolder;
  public get folder() {
    if (!this._folder) {
      this._folder = Inventory.StudentFolders.get(this.hostId);
    }
    return this._folder;
  }

  private _advisor?: Advisor;
  public get advisor() {
    if (!this._advisor) {
      this._advisor = this.getAdvisor();
    }
    return this._advisor;
  }

  public getAdvisor = (year = Advisor.ByYear.Current) =>
    Advisor.getByAdvisee(this.hostId, year);

  public static all(): Student[] {
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

  public static getForms(): number[] {
    return [
      ...new Set(Student.getData().map(([, , , , gradYear]) => gradYear))
    ].sort();
  }
}

namespace Student { }

export { Student as default };
