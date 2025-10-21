import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import lib from '../lib';
import Student from './Student';

class Advisor {
  private static _data: { [k in lib.CoursePlanningData.SheetName]?: any[][] } =
    {};
  private static getData(sheet = lib.CoursePlanningData.sheet.AdvisorList) {
    if (!this._data[sheet]) {
      this._data[sheet] = g.SpreadsheetApp.Range.getEntireSheet(
        SpreadsheetApp.getActive().getSheetByName(sheet)
      ).getValues();
      this._data[sheet].shift(); // strip column labels
    }
    return this._data[sheet];
  }

  private static cache: { [email: Inventory.Key]: Advisor } = {};
  private static getFromCache(data: any[]) {
    if (
      this.cache[data[lib.CoursePlanningData.column.AdvisorList.AdvisorEmail]]
    ) {
      return this.cache[
        data[lib.CoursePlanningData.column.AdvisorList.AdvisorEmail]
      ];
    } else {
      return new Advisor(data);
    }
  }

  public readonly email: string;
  public readonly firstName: string;
  public readonly lastName: string;

  private _folder?: Inventory.Module.AdvisorFolders.AdvisorFolder;
  public get folder() {
    if (!this._folder) {
      this._folder = Inventory.AdvisorFolders.get(this.email);
    }
    return this._folder;
  }

  public constructor(data: Advisor.ConstructorParameter) {
    if (Array.isArray(data)) {
      const [, , , , , , email, firstName, lastName] = data;
      data = { email, firstName, lastName };
    }
    Object.assign(this, data);
    Advisor.cache[this.email] = this;
  }

  public get formattedName() {
    return `${this.firstName} ${this.lastName}`;
  }

  public static get(email: string) {
    if (this.cache[email]) {
      return this.cache[email];
    } else {
      let row = this.getData(lib.CoursePlanningData.sheet.AdvisorList).find(
        (row) =>
          row[lib.CoursePlanningData.column.AdvisorList.AdvisorEmail] == email
      );
      return (row && new Advisor(row)) || null;
    }
  }

  public static for(
    hostId: string,
    sheet = lib.CoursePlanningData.sheet.AdvisorList
  ) {
    const row = Advisor.getData(sheet).filter(
      (row) => row[lib.CoursePlanningData.column.AdvisorList.HostId] == hostId
    )[0];
    return (row && this.getFromCache(row)) || undefined;
  }

  public static getPreviousYearStudent(hostId: string) {
    /*
    const row = this.getData(
      lib.CoursePlanningData.sheet.AdvisorListPreviousYear
    ).find(([id]) => id === hostId);
    let student: Student;
    if (row) {
      const [
        // FIXME unsafely assumes column order
        hostId,
        email,
        firstName,
        lastName,
        gradYear,
        advisorEmail,
        advisorFirstName,
        advisorLastName
      ] = row;
      student = new Student({
        hostId,
        email,
        firstName,
        lastName,
        gradYear,
        previousAdvisor: {
          email: advisorEmail,
          firstName: advisorFirstName,
          lastName: advisorLastName
        }
      });
    }
    return student;
    */
   return null;
  }
}

namespace Advisor {
  export type ConstructorParameter =
    | any[]
    | {
      email: string;
      firstName: string;
      lastName: string;
    };
}

export { Advisor as default };
