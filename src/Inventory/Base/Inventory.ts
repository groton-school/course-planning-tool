import g from '@battis/gas-lighter';
import lib from '../../lib';
import Item from './Item';

abstract class Inventory<ItemType extends Item = Item> {
  private data?: any[][];
  private sheet: GoogleAppsScript.Spreadsheet.Sheet;

  constructor(sheetName: lib.CoursePlanningData.SheetName) {
    this.sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  }

  protected abstract getter(id: string, key?: Inventory.Key): ItemType;
  protected abstract creator(key: Inventory.Key): ItemType;

  private getData() {
    if (!this.data) {
      this.data = g.SpreadsheetApp.Range.getEntireSheet(
        this.getSheet()
      ).getValues();
    }
    return this.data;
  }

  public getMetadata = (key: Inventory.Key, column: number) =>
    this.getData().find((row) => row[0] == key)[column - 1];

  public setMetadata = (key: Inventory.Key, column: number, value: any) =>
    this.getData().forEach((entry, row: number) => {
      if (entry[0] == key) {
        entry[column - 1] = value;
        this.getSheet()
          .getRange(row + 1, column)
          .setValue(value);
      }
    });

  public has = (key: Inventory.Key): boolean =>
    this.getData().findIndex(([k]) => k == key) >= 0;

  public get(key: Inventory.Key) {
    const id = this.getData()
      .find(([k]) => k == key)
      .shift()?.id;
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
    const row = this.getData().findIndex(([k]) => k == key);
    this.data = this.data.splice(row, 1);
    this.getSheet().deleteRow(row + 1);
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
