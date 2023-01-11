class Student {
    public hostId: string;
    public email: string;
    public firstName: string;
    public lastName: string;
    public gradYear: number;

    public constructor(data: Object) {
        if (Array.isArray(data)) {
            const [hostId, email, firstName, lastName, gradYear] = data;
            data = { hostId, email, firstName, lastName, gradYear };
        }
        Object.assign(this, data);
    }

    public getFormattedName(): string {
        return `${this.firstName} ${this.lastName} '${this.gradYear - 2000}`;
    }
}
