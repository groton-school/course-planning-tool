export default function debug(data, message = 'Debug') {
    SpreadsheetApp.getUi().showModalDialog(
        HtmlService.createHtmlOutput(
            '<pre>' + JSON.stringify(data, null, 2) + '</pre>'
        ),
        message
    );
}
