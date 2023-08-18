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

  private cache: { [key: Inventory.Key]: ItemType } = {};

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
    if (!this.cache[key]) {
      const [, id] = this.data.find(([k]) => k == key) || [];
      if (!id) {
        this.cache[key] = this.creator(key);
      }
      try {
        this.cache[key] = this.getter(id, key);
      } catch (e) {
        this.cache[key] = this.getter(id); // not everyone _wants_ the key!
      }
    }
    return this.cache[key];
  }

  public add(entry: Inventory.Entry): void;
  public add(item: ItemType): void;
  public add(addable: ItemType | Inventory.Entry) {
    if (addable instanceof Item) {
      this.cache[addable.key] = addable;
    }
    const row = [addable.key, addable.id, addable.url];
    this.sheet.appendRow(row);
    this.data.push(row);
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
  export type Key = number | string;
  export type Entry = { key: Key; id: string; url: string };
  export type Formatter = (key: Key) => string;
}

export { Inventory as default };
