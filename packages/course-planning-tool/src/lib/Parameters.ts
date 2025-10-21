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

  public static get numOptionsPerDepartment() {
    return this.getParam(
      CoursePlanningData.namedRange.ParamNumOptionsPerDepartment
    );
  }

  public static get numComments() {
    return this.getParam(CoursePlanningData.namedRange.ParamNumComments);
  }

  private static get studentNameFormat() {
    return this.getParam(CoursePlanningData.namedRange.ParamStudentNameFormat);
  }

  private static get formFolderNameFormat() {
    return this.getParam(
      CoursePlanningData.namedRange.ParamFormFolderNameFormat
    );
  }

  private static get studentFolderNameFormat() {
    return this.getParam(
      CoursePlanningData.namedRange.ParamStudentFolderNameFormat
    );
  }

  private static get advisorFolderNameFormat() {
    return this.getParam(
      CoursePlanningData.namedRange.ParamAdvisorFolderNameFormat
    );
  }

  private static get coursePlanNameFormat() {
    return this.getParam(
      CoursePlanningData.namedRange.ParamCoursePlanNameFormat
    );
  }

  public static nameFormat = {
    student: this.studentNameFormat,
    formFolder: this.formFolderNameFormat,
    studentFolder: this.studentFolderNameFormat,
    advisorFolder: this.advisorFolderNameFormat,
    coursePlan: this.coursePlanNameFormat
  };

  private static get academicOfficeEmail() {
    return this.getParam(CoursePlanningData.namedRange.ParamAcademicOffice);
  }

  private static get studiesCommitteeEmail() {
    return this.getParam(CoursePlanningData.namedRange.ParamStudiesCommittee);
  }

  private static get collegeCounselingEmail() {
    return this.getParam(CoursePlanningData.namedRange.ParamCollegeCounseling);
  }

  public static email = {
    academicOffice: this.academicOfficeEmail,
    studiesCommittee: this.studiesCommitteeEmail,
    collegeCounseling: this.collegeCounselingEmail
  };

  public static get planTemplateUrl() {
    return this.getParam(CoursePlanningData.namedRange.ParamCoursePlanTemplate);
  }

}

namespace Config { }

export { Config as default };
