import g from '@battis/gas-lighter';

enum ByYear {
  Current = 'Advisor List',
  Previous = 'Advisor List (Previous Year)'
}

export class Advisor {
  public static ByYear = ByYear;

  private static data: { [k in ByYear]?: any[][] } = {};

  public email: string;
  public firstName: string;
  public lastName: string;

  public constructor(data: object) {
    if (Array.isArray(data)) {
      const [email, firstName, lastName] = data;
      data = { email, firstName, lastName };
    }
    Object.assign(this, data);
  }

  public getFormattedName = () => `${this.firstName} ${this.lastName}`;

  private static getData(year = ByYear.Current) {
    if (!Advisor.data[year]) {
      Advisor.data[year] = g.SpreadsheetApp.Range.getEntireSheet(
        SpreadsheetApp.getActive().getSheetByName(year.toString())
      ).getValues();
      Advisor.data[year].shift(); // strip column labels
    }
    return Advisor.data[year];
  }

  public static getByEmail(email: string, year = ByYear.Current) {
    const [, , , , , e, firstName, lastName] = Advisor.getData(year).filter(
      ([, , , , , e]) => e == email
    )[0];
    return new Advisor({ email: e, firstName, lastName });
  }

  public static getByAdvisee(hostId: string, year = ByYear.Current) {
    const [, , , , , email, firstName, lastName] = Advisor.getData(year).filter(
      ([id]) => id == hostId
    )[0];
    return new Advisor({ email, firstName, lastName });
  }
}
