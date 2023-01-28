import Constants from './Constants';
import State from './State';

export default class SheetParameters {
    private static params?: GoogleAppsScript.Spreadsheet.Sheet;

    public static getParam(a1Notation) {
        if (!SheetParameters.params) {
            SheetParameters.params = State.getDataSheet().getSheetByName(
                Constants.Spreadsheet.Sheet.PARAMETERS
            );
        }
        return SheetParameters.params.getRange(a1Notation).getValue();
    }

    public static getNumOptionsPerDepartment = SheetParameters.getParam.bind(
        null,
        Constants.Spreadsheet.A1Notation.NUM_OPTIONS_PER_DEPT
    );

    public static getFormFolderNameFormat = SheetParameters.getParam.bind(
        null,
        Constants.Spreadsheet.A1Notation.FORM_FOLDER_NAME_FORMAT
    );

    public static getAdvisorFolderNameFormat = SheetParameters.getParam.bind(
        null,
        Constants.Spreadsheet.A1Notation.ADVISOR_FOLDER_NAME_FORMAT
    );

    public static getCoursePlanNameFormat = SheetParameters.getParam.bind(
        null,
        Constants.Spreadsheet.A1Notation.COURSE_PLAN_NAME_FORMAT
    );
}
