import { Terse } from '@battis/google-apps-script-helpers';
import Constants from './Constants';
import Student from './Student';

export default class State {
  private static readonly PROP_STUDENT = `${Constants.PREFIX}.State.student`;

  private static dataSheet?: GoogleAppsScript.Spreadsheet.Spreadsheet;
  private static template?: GoogleAppsScript.Spreadsheet.Spreadsheet;

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

  public static getStudent() {
    return new Student(
      JSON.parse(Terse.PropertiesService.getUserProperty(State.PROP_STUDENT))
    );
  }

  public static setStudent(student: Student | string) {
    Terse.PropertiesService.setUserProperty(
      State.PROP_STUDENT,
      student instanceof Student ? JSON.stringify(student) : student
    );
  }

  public static resetStudent() {
    Terse.PropertiesService.deleteUserProperty(State.PROP_STUDENT);
  }

  public static toJSON() {
    return JSON.stringify(
      {
        student: State.getStudent(),
        dataSheet: State.getDataSheet().getId(),
      },
      null,
      2
    );
  }
}
