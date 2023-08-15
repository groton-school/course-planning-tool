import g from '@battis/gas-lighter';
import CoursePlanningData from './CoursePlanningData';

class Config {
  private constructor() {
    // static-onlty
  }

  private static _params: GoogleAppsScript.Spreadsheet.Sheet = null;
  private static get params() {
    if (!this._params) {
      this._params = SpreadsheetApp.getActive().getSheetByName(
        CoursePlanningData.sheet.Parameters
      );
    }
    return this._params;
  }

  private static getParam(namedRange: string) {
    const range = this.params.getRange(namedRange);
    if (range.getNumRows() > 1) {
      return range.getValues().reduce((data, [cell]) => {
        if (cell.length) {
          data.push(cell);
        }
        return data;
      }, []);
    }
    return range.getValue();
  }

  private static setParam(namedRange: string, value: any) {
    g.SpreadsheetApp.Value.set(this.params, namedRange, value);
  }

  public static getNumOptionsPerDepartment = () =>
    this.getParam(CoursePlanningData.namedRange.ParamNumOptionsPerDepartment);

  public static getNumComments = () =>
    this.getParam(CoursePlanningData.namedRange.ParamNumComments);

  public static getFormFolderNameFormat = () =>
    this.getParam(CoursePlanningData.namedRange.ParamFormFolderNameFormat);

  public static getStudentFolderNameFormat = () =>
    this.getParam(CoursePlanningData.namedRange.ParamStudentFolderNameFormat);

  public static getAdvisorFolderNameFormat = () =>
    this.getParam(CoursePlanningData.namedRange.ParamAdvisorFolderNameFormat);

  public static getCoursePlanNameFormat = () =>
    this.getParam(CoursePlanningData.namedRange.ParamCoursePlanNameFormat);

  public static getStudiesCommittee = () =>
    this.getParam(CoursePlanningData.namedRange.ParamStudiesCommittee);

  public static getCollegeCounseling = () =>
    this.getParam(CoursePlanningData.namedRange.ParamCollegeCounseling);

  public static getCoursePlanTemplate = () =>
    this.getParam(CoursePlanningData.namedRange.ParamCoursePlanTemplate);

  public static getRollOverAcademicYear = () =>
    new Date(
      this.getParam(CoursePlanningData.namedRange.ParamRollOverAcademicYear) ||
      0
    );

  public static setRollOverAcademicYear = (rollOverDate: Date) =>
    this.setParam(
      CoursePlanningData.namedRange.ParamRollOverAcademicYear,
      rollOverDate.toISOString()
    );
}

namespace Config { }

export { Config as default };
