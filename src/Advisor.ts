import Constants from './Constants';
import State from './State';

export default class Advisor {
    private static data?;

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

    private static getData() {
        if (!Advisor.data) {
            const advisors = State.getDataSheet().getSheetByName(
                Constants.Spreadsheet.Sheet.ADVISORS
            );
            Advisor.data = advisors
                .getRange(1, 1, advisors.getMaxRows(), advisors.getMaxColumns())
                .getValues();
        }
        return Advisor.data;
    }

    public static getByEmail(email: string) {
        return new Advisor(
            Advisor.getData().reduce(
                (data, [hid, sem, sfn, sln, gy, em, firstName, lastName]) => {
                    if (em == email) {
                        return { email, firstName, lastName };
                    }
                    return data;
                },
                null
            )
        );
    }

    public static getByAdvisee(hostId: string) {
        return new Advisor(
            Advisor.getData().reduce(
                (data, [hid, sem, sfn, sln, gy, email, firstName, lastName]) => {
                    if (hid == hostId) {
                        return { email, firstName, lastName };
                    }
                    return data;
                },
                null
            )
        );
    }
}
