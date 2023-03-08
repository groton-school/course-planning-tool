import g from '@battis/gas-lighter';

export class Advisor {
    private static data?: any[][];

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

    private static getData() {
        if (!Advisor.data) {
            Advisor.data = g.SpreadsheetApp.Range.getEntireSheet(
                SpreadsheetApp.getActive().getSheetByName('Advisor List')
            ).getValues();
            Advisor.data.shift(); // strip column labels
        }
        return Advisor.data;
    }

    public static getByEmail(email: string) {
        const [, , , , , e, firstName, lastName] = Advisor.getData().filter(
            ([, , , , , e]) => e == email
        )[0];
        return new Advisor({ email: e, firstName, lastName });
    }

    public static getByAdvisee(hostId: string) {
        const [, , , , , email, firstName, lastName] = Advisor.getData().filter(
            ([id]) => id == hostId
        )[0];
        return new Advisor({ email, firstName, lastName });
    }
}
