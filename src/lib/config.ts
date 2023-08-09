import CoursePlanningData from './CoursePlanningData';

let params: GoogleAppsScript.Spreadsheet.Sheet = null;

export function getParam(namedRange: string) {
  if (!params) {
    params = SpreadsheetApp.getActive().getSheetByName(
      CoursePlanningData.sheet.Parameters
    );
  }
  const range = params.getRange(namedRange);
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

export const getNumOptionsPerDepartment = getParam.bind(
  null,
  CoursePlanningData.namedRange.ParamNumOptionsPerDepartment
);

export const getNumComments = getParam.bind(
  null,
  CoursePlanningData.namedRange.ParamNumComments
);

export const getFormFolderNameFormat = getParam.bind(
  null,
  CoursePlanningData.namedRange.ParamFormFolderNameFormat
);

export const getStudentFolderNameFormat = getParam.bind(
  null,
  CoursePlanningData.namedRange.ParamStudentFolderNameFormat
);

export const getAdvisorFolderNameFormat = getParam.bind(
  null,
  CoursePlanningData.namedRange.ParamAdvisorFolderNameFormat
);

export const getCoursePlanNameFormat = getParam.bind(
  null,
  CoursePlanningData.namedRange.ParamCoursePlanNameFormat
);

export const getStudiesCommittee = getParam.bind(
  null,
  CoursePlanningData.namedRange.ParamStudiesCommittee
);

export const getCollegeCounseling = getParam.bind(
  null,
  CoursePlanningData.namedRange.ParamCollegeCounseling
);

export const getCoursePlanTemplate = getParam.bind(
  null,
  CoursePlanningData.namedRange.ParamCoursePlanTemplate
);
