import g from '@battis/gas-lighter';

export type Key = number | string;
export type Entry = [Key, string, string];
export type Formatter = (key: Key) => string;

export default abstract class Inventory<T> {
    public static COL_KEY = 1;
    public static COL_ID = 2;
    public static COL_URL = 3;

    private data?: any[][];
    private sheet: GoogleAppsScript.Spreadsheet.Sheet;

    constructor(sheetName: string) {
        this.sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
    }

    protected abstract getter(id: string, key?: Key): T;
    protected abstract creator(key: Key): T;

    private getData() {
        if (!this.data) {
            this.data = g.SpreadsheetApp.Range.getEntireSheet(
                this.getSheet()
            ).getValues();
        }
        return this.data;
    }

    public getMetadata = (key: Key, column: number) => this.getData().find(row => row[Inventory.COL_KEY - 1] == key)[column - 1];

    public setMetadata = (key: Key, column: number, value: any) =>
        this.getData().forEach((entry, row: number) => {
            if (entry[0] == key) {
                entry[column - 1] = value;
                this.getSheet()
                    .getRange(row + 1, column)
                    .setValue(value);
            }
        });

    public has = (key: Key): boolean =>
        this.getData().findIndex(([k]) => k == key) >= 0;

    public get(key: Key): T {
        const id = this.getData().reduce((id: string, [k, i]) => {
            if (k == key) {
                return i;
            }

            return id;
        }, null);
        if (!id) {
            return this.creator(key);
        }
        try {
            return this.getter(id, key);
        } catch (e) {
            return this.getter(id); // not everyone _wants_ the key!
        }
    }

    public add(entry: Entry) {
        this.sheet.appendRow(entry);
        this.data.push(entry);
    }

    public remove(key: Key) {
        const row = this.getData().findIndex(([k]) => k == key);
        this.data = this.data.splice(row, 1);
        this.getSheet().deleteRow(row + 1);
    }

    protected getSheet = () => this.sheet;
}
