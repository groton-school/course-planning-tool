import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import Year from './Year';

class Advisor {
  private static _data: { [k in Year]?: any[][] } = {};
  private static getData(year = Year.Current) {
    if (!this._data[year]) {
      this._data[year] = g.SpreadsheetApp.Range.getEntireSheet(
        SpreadsheetApp.getActive().getSheetByName(year.toString())
      ).getValues();
      this._data[year].shift(); // strip column labels
    }
    return this._data[year];
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

  private constructor(data: object) {
    if (Array.isArray(data)) {
      const [email, firstName, lastName] = data;
      data = { email, firstName, lastName };
    }
    Object.assign(this, data);
  }

  public get formattedName() {
    return `${this.firstName} ${this.lastName}`;
  }

  public static getByEmail(email: string, year = Year.Current) {
    const [, , , , , e, firstName, lastName] = Advisor.getData(year).filter(
      ([, , , , , e]) => e == email
    )[0];
    return new Advisor({ email: e, firstName, lastName });
  }

  public static getByAdvisee(hostId: string, year = Year.Current) {
    const [, , , , , email, firstName, lastName] = Advisor.getData(year).filter(
      ([id]) => id == hostId
    )[0];
    return new Advisor({ email, firstName, lastName });
  }
}

namespace Advisor { }

export { Advisor as default };
