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
  'Param_NumOptionsPerDepartment'
);

export const getNumComments = getParam.bind(null, 'Param_NumComments');

export const getFormFolderNameFormat = getParam.bind(
  null,
  'Param_FormFolderNameFormat'
);

export const getStudentFolderNameFormat = getParam.bind(
  null,
  'Param_StudentFolderNameFormat'
);

export const getAdvisorFolderNameFormat = getParam.bind(
  null,
  'Param_AdvisorFolderNameFormat'
);

export const getCoursePlanNameFormat = getParam.bind(
  null,
  'Param_CoursePlanNameFormat'
);

export const getStudiesCommittee = getParam.bind(
  null,
  'Param_StudiesCommittee'
);

export const getCollegeCounseling = getParam.bind(
  null,
  'Param_CollegeCounselingOffice'
);

export const getCoursePlanTemplate = getParam.bind(
  null,
  'Param_CoursePlanTemplate'
);
