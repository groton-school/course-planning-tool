import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import CoursePlan from '../Inventory/CoursePlans/CoursePlan';
import StudentFolder from '../Inventory/StudentFolders/StudentFolder';
import lib from '../lib';
import Advisor from './Advisor';
import Form from './Form';

class Student implements g.HtmlService.Element.Picker.Pickable {
  private static _data: any[][];
  private static get data() {
    if (!this._data) {
      this._data = g.SpreadsheetApp.Range.getEntireSheet(
        SpreadsheetApp.getActive().getSheetByName(
          lib.CoursePlanningData.sheet.StudentList
        )
      ).getValues();
      this._data.shift(); // strip column labels
    }
    return this._data;
  }

  private static cache: { [hostId: Inventory.Key]: Student } = {};
  private static getFromCache(data: any[]) {
    if (this.cache[data[lib.CoursePlanningData.column.StudentList.HostId]]) {
      return this.cache[data[lib.CoursePlanningData.column.StudentList.HostId]];
    } else {
      return new Student(data);
    }
  }

  public readonly hostId: string;
  public readonly email: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly gradYear: number;
  public readonly abbrevGradYear: number;
  public readonly newAdvisor: boolean;

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
  public get advisor(): Advisor | undefined {
    if (!this._advisor) {
      this._advisor = Advisor.for(this.hostId);
    }
    return this._advisor;
  }

  private _previousAdvisor?: Advisor;
  public get previousAdvisor() {
    if (!this._previousAdvisor) {
      this._previousAdvisor = Advisor.for(
        this.hostId,
        lib.CoursePlanningData.sheet.AdvisorListPreviousYear
      );
    }
    return this._previousAdvisor;
  }

  public constructor(data: Student.ConstructorParameter) {
    if (Array.isArray(data)) {
      const [
        // FIXME assumes column order unsafely
        hostId,
        email,
        firstName,
        lastName,
        gradYear,
        advisorEmail,
        advisorFirstName,
        advisorLastName,
        previousAdvisorEmail,
        previousAdvisorFirstName,
        previousAdvisorLastName
      ] = data;
      data = { hostId, email, firstName, lastName, gradYear };
      if (advisorEmail && advisorFirstName && advisorLastName) {
        data.advisor = {
          email: advisorEmail,
          firstName: advisorFirstName,
          lastName: advisorLastName
        };
      }
      if (
        previousAdvisorEmail &&
        previousAdvisorFirstName &&
        previousAdvisorLastName
      ) {
        data.previousAdvisor = {
          email: previousAdvisorEmail,
          firstName: previousAdvisorFirstName,
          lastName: previousAdvisorLastName
        };
      }
    }
    if (data.advisor) {
      this._advisor = new Advisor(data.advisor);
    }
    delete data.advisor;

    if (data.previousAdvisor) {
      this._previousAdvisor = new Advisor(data.previousAdvisor);
    }
    delete data.previousAdvisor;

    Object.assign(this, {
      ...data,
      abbrevGradYear: data.gradYear - 2000
    });
    Student.cache[this.hostId] = this;
  }

  public get formattedName() {
    return lib.Format.apply(lib.Parameters.nameFormat.student, this);
  }

  public static get(hostId: string, fallbackToPreviousYear = true) {
    if (!this.cache[hostId]) {
      const row = this.data.find(
        (row) => row[lib.CoursePlanningData.column.StudentList.HostId] == hostId
      );
      if (row) {
        this.cache[hostId] = new Student(row);
      } else if (fallbackToPreviousYear) {
        return Advisor.getPreviousYearStudent(hostId);
      }
    }
    return this.cache[hostId] || undefined;
  }

  public static all(): Student[] {
    return this.data
      .map((row) => this.getFromCache(row))
      .filter((student) => student.gradYear !== lib.currentSchoolYear());
  }

  public static getFormOf(gradYear: number): Student[] {
    return Student.data
      .map((row) => this.getFromCache(row))
      .filter((student) => student.gradYear === gradYear);
  }

  public static forms() {
    return [...new Set(Student.data.map(([, , , , gradYear]) => gradYear))]
      .sort()
      .map((f) => new Form(f));
  }

  toOption(): g.HtmlService.Element.Picker.Option {
    return { name: this.formattedName, value: this.hostId };
  }
}

namespace Student {
  export type ConstructorParameter =
    | any[]
    | {
      hostId: string;
      email: string;
      firstName: string;
      lastName: string;
      gradYear: number;
      advisor?: Advisor.ConstructorParameter;
      previousAdvisor?: Advisor.ConstructorParameter;
      previousAdvisorLastName?: boolean;
      newAdvisor?: boolean;
    };
}

export { Student as default };
