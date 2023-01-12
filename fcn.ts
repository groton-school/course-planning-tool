class s {

    public static readonly CHAR = 'CHAR';
    public static readonly FILTER = 'FILTER';
    public static readonly IF = 'IF';
    public static readonly IFNA = 'IFNA';
    public static readonly INDEX = 'INDEX';
    public static readonly JOIN = 'JOIN';
    public static readonly MATCH = 'MATCH';
    public static readonly SORT = 'SORT';
    public static readonly UNIQUE = 'UNIQUE';

    public static fcn(name: string, ...args): string {
        return `${name}(${args.join(',')})`
    }

    public static eq(a: string, b: string, stringify = true): string {
        return `${a}=${stringify ? JSON.stringify(b) : b}`;
    }

}
