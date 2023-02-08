import { Terse } from '@battis/gas-lighter';
import * as SheetParameters from './SheetParameters';

let dataSheet: GoogleAppsScript.Spreadsheet.Spreadsheet = null;
let template: GoogleAppsScript.Spreadsheet.Spreadsheet = null;

// TODO don't really need getDataSheet now that this is attached to the sheet
export function getDataSheet() {
    if (!dataSheet) {
        const id = Terse.PropertiesService.getScriptProperty('DATA');
        dataSheet = id && SpreadsheetApp.openById(id);
    }
    return dataSheet;
}

// TODO template should be a sheet parameter for visibility
export function getTemplate() {
    if (!template) {
        const url = SheetParameters.getCoursePlanTemplate();
        template = url && SpreadsheetApp.openByUrl(url);
    }
    return template;
}
