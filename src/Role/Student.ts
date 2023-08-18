import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import CoursePlan from '../Inventory/CoursePlans/CoursePlan';
import StudentFolder from '../Inventory/StudentFolders/StudentFolder';
import lib from '../lib';
import Advisor from './Advisor';
import Form from './Form';
import Year from './Year';

class Student implements g.HtmlService.Element.Picker.Pickable {
  private static _data: { [k in Year]?: any[][] } = {};
  private static getData(year = Year.Current) {
    if (!this._data[year]) {
      this._data[year] = g.SpreadsheetApp.Range.getEntireSheet(
        SpreadsheetApp.getActive().getSheetByName(
          year == Year.Current
            ? lib.CoursePlanningData.sheet.StudentList
            : year.toString()
        )
      ).getValues();
      this._data[year].shift(); // strip column labels
    }
    return this._data[year];
  }

  private static cache: { [hostId: Inventory.Key]: Student } = {};

  public readonly hostId: string;
  public readonly email: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly gradYear: number;
  public readonly abbrevGradYear: number;

  private constructor([hostId, email, firstName, lastName, gradYear]: any[]) {
    Object.assign(this, {
      hostId,
      email,
      firstName,
      lastName,
      gradYear,
      abbrevGradYear: gradYear - 2000
    });
  }

  public get formattedName() {
    return lib.Format.apply(lib.Parameters.nameFormat.student, this);
  }

  public static getByHostId(id: string, year = Year.Current) {
    if (!this.cache[id]) {
      const row = Student.getData(year).find(([hostId]) => hostId == id) || [];
      if (row) {
        this.cache[id] = new Student(row);
      }
    }
    return this.cache[id] || undefined;
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

  public getAdvisor = (year = Year.Current) =>
    Advisor.getByAdvisee(this.hostId, year);

  public static all(year = Year.Current): Student[] {
    const thisYear = lib.currentSchoolYear();
    return Student.getData(year)
      .filter(([, , , , gradYear]) => gradYear != thisYear)
      .map((row) => new Student(row));
  }

  public static getByForm(gradYear: number, year = Year.Current): Student[] {
    return Student.getData(year)
      .filter(([, , , , g]) => g == gradYear)
      .map((row) => new Student(row));
  }

  public static forms(year = Year.Current) {
    return [
      ...new Set(Student.getData(year).map(([, , , , gradYear]) => gradYear))
    ]
      .sort()
      .map((f) => new Form(f));
  }

  toOption(): g.HtmlService.Element.Picker.Option {
    return { name: this.formattedName, value: this.hostId };
  }
}

namespace Student { }

export { Student as default };
