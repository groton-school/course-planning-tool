export default class Student {
    public hostId: string;
    public email: string;
    public firstName: string;
    public lastName: string;
    public gradYear: number;
    public abbrevGradYear: number;

    public constructor(data: object) {
        if (Array.isArray(data)) {
            const [hostId, email, firstName, lastName, gradYear] = data;
            data = { hostId, email, firstName, lastName, gradYear };
        }
        Object.assign(this, data);
        this.abbrevGradYear = this.gradYear - 2000;
    }

    public getFormattedName(): string {
        return `${this.firstName} ${this.lastName} ‘${this.gradYear - 2000}`;
    }
}
