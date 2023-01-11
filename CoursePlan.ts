
class CoursePlan {
  public static readonly RANGE_HOST_ID = 'Enrollment_Host_ID';
  public static readonly RANGE_TITLE = 'Enrollment_Title';
  public static readonly RANGE_DEPT = 'Enrollment_Department';
  public static readonly RANGE_YEAR = 'Enrollment_Year';
  public static readonly RANGE_TERM = 'Enrollment_Term'
  public static readonly A1_NUM_OPT_PER_DEPT = 'B1';

  public static readonly SHEET_DEPTS = 'Courses by Department';
  public static readonly SHEET_TEMPLATE = 'Template';
  public static readonly SHEET_MOCKUP = 'Mockup';
  public static readonly SHEET_PARAMS = 'Parameters';

  public static readonly GRACE = 'GRACE';

  public static actions = class {
    public static mockup(): GoogleAppsScript.Card_Service.ActionResponse {
      const spreadsheet = SpreadsheetApp.getActive();
      spreadsheet.deleteSheet(spreadsheet.getSheetByName(CoursePlan.SHEET_MOCKUP));
      var sheet = spreadsheet.setActiveSheet(spreadsheet.getSheetByName(CoursePlan.SHEET_TEMPLATE));
      sheet = spreadsheet.duplicateActiveSheet();
      sheet.setName(CoursePlan.SHEET_MOCKUP);
      const student = new Student(JSON.parse(TersePropertiesService.getUserProperty(App.PROP_STUDENT)));
      const numYears = 5;

      const replaceWithValue = (a1notation: string, value, replace = false) => {
        const range = sheet.getRange(a1notation);

        if (Array.isArray(value)) {
          if (!Array.isArray(value[0])) {
            value = [value];
          }
          range.setValues(value);
        } else {
          range.offset(0, 0, 1, 1).setValue(value);
        }
        if (replace) {
          if (range.getNumRows() > 1 || range.getNumColumns() > 1) {
            range.setValues(range.getValues());
          } else {
            range.setValue(range.getValue());
          }
        }
      }

      sheet.getRange('A3:E3').clear();

      replaceWithValue('A1:A2', [[student.getFormattedName()], [`="Advisor: "&JOIN(" ",INDEX('${App.SHEET_ADVISORS}'!G:H,MATCH("${student.hostId}",'${App.SHEET_ADVISORS}'!A:A,0),0))`]]);
      const years: (string | number)[] = [4, 3, 2, 1, 0].map(value => `${student.gradYear - value - 1} - ${student.gradYear - value}`);
      years.splice(2, 0, student.gradYear - 3);
      replaceWithValue('B5:G5', years);

      const topLeft = sheet.getRange('B6');
      const validation = sheet.getParent().getSheetByName(CoursePlan.SHEET_DEPTS);
      const numDepartments = validation.getMaxColumns();
      const now = new Date();
      const schoolYear = now.getMonth() > 6 ? now.getFullYear() + 1 : now.getFullYear();
      const values = [];
      const validations = [];
      for (var row = 0; row < numDepartments; row++) {
        const rowValue = [];
        const rowValidation = [];
        for (var column = 0; column < numYears + 1; column++) {
          const year = topLeft.offset(-1, column).getValue();
          if ((year.substr ? Number(year.substr(0, 4)) : year) < schoolYear) {
            if (topLeft.offset(-2, column).getValue() == CoursePlan.GRACE) {
              if (row == numDepartments - 1) {
                rowValue.push(`=IFNA(JOIN(CHAR(10),FILTER(${CoursePlan.RANGE_TITLE}, ${CoursePlan.RANGE_HOST_ID}="${student.hostId}",${CoursePlan.RANGE_DEPT}="${CoursePlan.GRACE}")),)`);
              } else {
                rowValue.push('');
              }
            } else {
              const department = topLeft.offset(row, -1).getValue();
              rowValue.push(`=IFNA(JOIN(CHAR(10),UNIQUE(FILTER(${CoursePlan.RANGE_TITLE}&IF(${CoursePlan.RANGE_TERM}<>""," ("&${CoursePlan.RANGE_TERM}&")",""),${CoursePlan.RANGE_HOST_ID}="${student.hostId}",${CoursePlan.RANGE_YEAR}="${year}",${CoursePlan.RANGE_DEPT}="${department}"))),)`);
            }
          } else {
            rowValidation.push(SpreadsheetApp.newDataValidation()
              .requireValueInRange(validation.getRange('A2:A').offset(0, row))
              .build());
          }
        }
        values.push(rowValue);
        validations.push(rowValidation);
      }
      topLeft.offset(0, 0, values.length, values[0].length).setValues(values);
      if (validations[0].length) {
        topLeft.offset(0, values[0].length, validations.length, validations[0].length).setDataValidations(validations);
      }

      const numOptions = sheet.getParent().getSheetByName(CoursePlan.SHEET_PARAMS).getRange(CoursePlan.A1_NUM_OPT_PER_DEPT).getValue();
      for (var row = 0; row < numDepartments * numOptions; row += numOptions) {
        sheet.insertRowsAfter(topLeft.getRow() + row, numOptions - 1);
        topLeft.offset(row, -1, numOptions, values[0].length + 1).mergeVertically();
      }

      // TODO deal with GRACE course selection
      // TODO add advisor notes (protected)
      // TODO add studies committee notes (protected)
      // TODO add college counseling notes (protected)
      /*
       * TODO create individual student spreadsheets
       *   Create in form-level folders (updating Form Folder Inventory) and add their ID and URL as columns on the Advisor List, update student access permissions
       */
      /*
       * TODO alias student spreadsheets to advisor folders
       *   Create advisor folders as needed and update Advisor Folder Inventory, update advisor access permissions
       */

      return TerseCardService.replaceStack(App.cards.error(`Mocked up ${student.getFormattedName()}`, JSON.stringify(student, null, 2)));
    }
  }
}

function __CoursePlan_actions_mockup() {
  return CoursePlan.actions.mockup();
}
