import g from '@battis/gas-lighter';
import lib from '../../lib';
import Item from './Item';

abstract class Inventory<ItemType extends Item = Item> {
  private _data?: any[][];
  protected get data() {
    if (!this._data) {
      this._data = g.SpreadsheetApp.Range.getEntireSheet(
        this.getSheet()
      ).getValues();
      this._data.shift(); // strip column labels
    }
    return this._data;
  }

  private sheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(sheetName: lib.CoursePlanningData.SheetName) {
    this.sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  }

  protected abstract getter(id: string, key?: Inventory.Key): ItemType;
  protected abstract creator(key: Inventory.Key): ItemType;

  public getMetadata = (key: Inventory.Key, column: number) =>
    (this.data.find((row) => row[0] == key) || [])[column];

  public setMetadata = (key: Inventory.Key, column: number, value: any) =>
    this.data.forEach((entry, row: number) => {
      if (entry[0] == key) {
        entry[column] = value;
        this.getSheet()
          .getRange(row + 2, column + 1) // 0-indexed array without headers --> 1-indexed sheet with headers
          .setValue(value);
      }
    });

  public has = (key: Inventory.Key): boolean =>
    this.data.findIndex(([k]) => k == key) >= 0;

  public get(key: Inventory.Key) {
    const [, id] = this.data.find(([k]) => k == key) || [];
    if (!id) {
      return this.creator(key);
    }
    try {
      return this.getter(id, key);
    } catch (e) {
      return this.getter(id); // not everyone _wants_ the key!
    }
  }

  public add(entry: Inventory.Entry) {
    this.sheet.appendRow(entry);
    this.data.push(entry);
  }

  public remove(key: Inventory.Key) {
    const row = this.data.findIndex(([k]) => k == key);
    this._data = this.data.splice(row, 1);
    this.getSheet().deleteRow(row + 1);
  }

  public all() {
    return this.data.map(([key, id]) => this.getter(id, key));
  }

  public getSheet = () => this.sheet;
}

namespace Inventory {
  __dirname;
  export type Key = number | string;
  export type Entry = [Key, string, string];
  export type Formatter = (key: Key) => string;
}

export { Inventory as default };
