import Constants from './Constants';
import State from './State';

export default class Advisor {
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

    public getFormattedName() {
        return `${this.firstName} ${this.lastName}`;
    }

    public static getByEmail(email: string): Advisor {
        return new Advisor(
            State.getDataSheet()
                .getSheetByName(Constants.Spreadsheet.Sheet.ADVISORS)
                .createTextFinder(email)
                .matchEntireCell(true)
                .findNext()
                .offset(0, 0, 1, 3)[0]
        );
    }
}
