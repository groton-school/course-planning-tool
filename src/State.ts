import { Terse } from '@battis/gas-lighter';

export default class State {
  private static dataSheet?: GoogleAppsScript.Spreadsheet.Spreadsheet;
  private static template?: GoogleAppsScript.Spreadsheet.Spreadsheet;

  // TODO don't really need getDataSheet now that this is attached to the sheet
  public static getDataSheet() {
    if (!this.dataSheet) {
      const id = Terse.PropertiesService.getScriptProperty('DATA');
      State.dataSheet = id && SpreadsheetApp.openById(id);
    }
    return State.dataSheet;
  }

  public static getTemplate() {
    if (!this.template) {
      const id = Terse.PropertiesService.getScriptProperty('TEMPLATE');
      State.template = id && SpreadsheetApp.openById(id);
    }
    return State.template;
  }
}
