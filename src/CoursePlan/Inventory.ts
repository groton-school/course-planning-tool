
export type Key = number | string;
export type Entry = [Key, string, string];
export type Formatter = (key: Key) => string;

export default abstract class Inventory<T> {
    private sheet: GoogleAppsScript.Spreadsheet.Sheet;

    constructor(sheetName: string) {
        this.sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
    }

    protected abstract getter(id: string, key?: Key): T;
    protected abstract creator(key: Key): T;

    private getData() {
        // TODO reasonably, caching this should improve performance, no?
        return this.sheet
            .getRange(1, 1, this.sheet.getMaxRows(), this.sheet.getMaxColumns())
            .getValues();
    }

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

    public add = (entry: Entry) => this.sheet.appendRow(entry);
}
