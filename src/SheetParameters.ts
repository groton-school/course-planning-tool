export default class SheetParameters {
    private static readonly SHEET_PARAMS = 'Parameters';

    private static readonly A1_NUM_OPT_PER_DEPT = 'B1';
    public static readonly NUM_OPTIONS_PER_DEPT = Symbol('opt-per-dept');

    public static getParam(key: Symbol, spreadsheet = null) {
        if (!spreadsheet) {
            spreadsheet = SpreadsheetApp.getActive();
        }
        switch (key) {
            case SheetParameters.NUM_OPTIONS_PER_DEPT:
                return spreadsheet
                    .getSheetByName(SheetParameters.SHEET_PARAMS)
                    .getRange(SheetParameters.A1_NUM_OPT_PER_DEPT)
                    .getValue();
            default:
                return null;
        }
    }
}
