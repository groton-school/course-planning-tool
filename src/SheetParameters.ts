import State from './State';

export default class SheetParameters {
  private static params?: GoogleAppsScript.Spreadsheet.Sheet;

  public static getParam(namedRange: string) {
    if (!SheetParameters.params) {
      SheetParameters.params =
        State.getDataSheet().getSheetByName('Parameters');
    }
    const range = SheetParameters.params.getRange(namedRange);
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

  public static getNumOptionsPerDepartment = SheetParameters.getParam.bind(
    null,
    'Param_NumOptionsPerDepartment'
  );

  public static getNumComments = SheetParameters.getParam.bind(
    null,
    'Param_NumComments'
  );

  public static getFormFolderNameFormat = SheetParameters.getParam.bind(
    null,
    'Param_FormFolderNameFormat'
  );

  public static getAdvisorFolderNameFormat = SheetParameters.getParam.bind(
    null,
    'Param_AdvisorFolderNameFormat'
  );

  public static getCoursePlanNameFormat = SheetParameters.getParam.bind(
    null,
    'Param_CoursePlanNameFormat'
  );

  public static getStudiesCommittee = SheetParameters.getParam.bind(
    null,
    'Param_StudiesCommittee'
  );

  public static getCollegeCounseling = SheetParameters.getParam.bind(
    null,
    'Param_CollegeCounselingOffice'
  );
}
