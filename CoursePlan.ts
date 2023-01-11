
class CoursePlan {
  public static readonly RANGE_HOST_ID = 'Enrollment_Host_ID';
  public static readonly RANGE_TITLE = 'Enrollment_Title';
  public static readonly RANGE_DEPT = 'Enrollment_Department';
  public static readonly RANGE_YEAR = 'Enrollment_Year';
  public static readonly RANGE_TERM = 'Enrollment_Term'

  public static readonly SHEET_DEPTS = 'Courses by Department';
  public static readonly SHEET_TEMPLATE = 'Template';
  public static readonly SHEET_MOCKUP = 'Mockup';

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

      const replaceWithValue = (a1notation, value) => {
        const range = sheet.getRange(a1notation);

        if (Array.isArray(value)) {
          range.setValues(value);
        } else {
          range.offset(0, 0, 1, 1).setValue(value);
        }

        if (range.getNumRows() > 1 || range.getNumColumns() > 1) {
          range.setValues(range.getValues());
        } else {
          range.setValue(range.getValue());
        }
      }

      sheet.getRange('A3:E3').clear();

      replaceWithValue('A1', student.getFormattedName());
      replaceWithValue('A2', `="Advisor: "&JOIN(" ",INDEX('${App.SHEET_ADVISORS}'!G:H,MATCH("${student.hostId}",'${App.SHEET_ADVISORS}'!A:A,0),0))`);
      replaceWithValue('B5:G5', `=ARRAYFORMULA(SEQUENCE(1,${numYears},${student.gradYear - 5}, 1)&" - "&SEQUENCE(1,${numYears},${student.gradYear - 4},1))`);
      replaceWithValue('E5:G5', sheet.getRange('D5:F5').getValues());
      replaceWithValue('D5', sheet.getRange('D5').getValue().substr(0, 4));

      const topLeft = sheet.getRange('B6');
      const validation = sheet.getParent().getSheetByName(CoursePlan.SHEET_DEPTS);
      const numDepartments = validation.getMaxColumns();
      for (var row = 0; row < numDepartments; row++) {
        for (var column = 0; column < numYears + 1; column++) {
          if (topLeft.offset(-2, column).getValue() == CoursePlan.GRACE) {
            if (row == numDepartments - 1) {
              replaceWithValue(topLeft.offset(row, column).getA1Notation(), `=IFNA(JOIN(CHAR(10),FILTER(${CoursePlan.RANGE_TITLE}, ${CoursePlan.RANGE_HOST_ID}="${student.hostId}",${CoursePlan.RANGE_DEPT}="${CoursePlan.GRACE}")),)`)
            }
          } else {
            const year = topLeft.offset(-1, column).getValue();
            if (Number(year.substr(0, 4)) < new Date().getFullYear()) {
              const department = topLeft.offset(row, -1).getValue();
              replaceWithValue(topLeft.offset(row, column).getA1Notation(), `=IFNA(JOIN(CHAR(10),UNIQUE(FILTER(${CoursePlan.RANGE_TITLE}&IF(${CoursePlan.RANGE_TERM}<>""," ("&${CoursePlan.RANGE_TERM}&")",""),${CoursePlan.RANGE_HOST_ID}="${student.hostId}",${CoursePlan.RANGE_YEAR}="${year}",${CoursePlan.RANGE_DEPT}="${department}"))),)`);
            } else {
              topLeft.offset(row, column, 1, (numYears + 1) - column).setDataValidation(SpreadsheetApp.newDataValidation()
                .requireValueInRange(validation.getRange('A2:A').offset(0, row))
                .build());
              break;
            }
          }
        }
      }

      // TODO deal with GRACE course selection
      // TODO deal with multiple planned courses from a single department
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
