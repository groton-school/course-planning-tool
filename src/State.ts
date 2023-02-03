import { Terse } from '@battis/google-apps-script-helpers';
import Constants from './Constants';

export default class State {
  private static PROGRESS = `${Constants.PREFIX}.State.progress`;
  private static COMPLETE = `${Constants.PREFIX}.State.complete`;

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

  public static setProgress(message) {
    if (typeof message != 'string') {
      message = JSON.stringify(message);
    }
    CacheService.getUserCache().put(State.PROGRESS, message, 10);
  }

  public static getProgress() {
    return CacheService.getUserCache().get(State.PROGRESS);
  }

  public static resetComplete() {
    CacheService.getUserCache().remove(State.PROGRESS);
    CacheService.getUserCache().remove(State.COMPLETE);
  }

  public static setComplete(message: string) {
    CacheService.getUserCache().put(State.COMPLETE, message);
  }

  public static getComplete() {
    return CacheService.getUserCache().get(State.COMPLETE);
  }
}
