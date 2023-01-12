
class CoursePlan {
  private static readonly RANGE_HOST_ID = 'Enrollment_Host_ID';
  private static readonly RANGE_TITLE = 'Enrollment_Title';
  private static readonly RANGE_ORDER = 'Enrollment_Order';
  private static readonly RANGE_DEPT = 'Enrollment_Department';
  private static readonly RANGE_YEAR = 'Enrollment_Year';

  private static readonly A1_NAMES = 'A1:A2';
  private static readonly A1_YEARS = 'B5:G5';
  private static readonly A1_ENROLLMENT_TOP_LEFT = 'B6';

  private static readonly SHEET_DEPTS = 'Courses by Department';
  private static readonly SHEET_TEMPLATE = 'Template';
  private static readonly SHEET_MOCKUP = 'Mockup';

  private static readonly GRACE = 'GRACE';

  private static sheet: GoogleAppsScript.Spreadsheet.Sheet = null;
  private static student: Student = null;

  private static replaceWithValue(a1notation: string, value, replace = false) {
    const range = CoursePlan.sheet.getRange(a1notation);

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

  private static createSheet() {
    const spreadsheet = SpreadsheetApp.getActive();
    const mockup = spreadsheet.getSheetByName(CoursePlan.SHEET_MOCKUP);
    if (mockup) {
      spreadsheet.deleteSheet(mockup);
    }
    CoursePlan.sheet = spreadsheet.setActiveSheet(spreadsheet.getSheetByName(CoursePlan.SHEET_TEMPLATE));
    CoursePlan.sheet = spreadsheet.duplicateActiveSheet();
    CoursePlan.sheet.setName(CoursePlan.SHEET_MOCKUP);
  }

  private static updateHeaders() {
    CoursePlan.replaceWithValue(CoursePlan.A1_NAMES, [
      [CoursePlan.student.getFormattedName()],
      ['="Advisor: "&' + s.fcn(s.JOIN, '" "',
        s.fcn(s.INDEX,
          `'${App.SHEET_ADVISORS}'!G:H`,
          s.fcn(s.MATCH,
            `"${CoursePlan.student.hostId}"`,
            `'${App.SHEET_ADVISORS}'!A:A`,
            0
          ),
          0
        )
      )]
    ]);
    const years: (string | number)[] = [4, 3, 2, 1, 0].map(value => `${CoursePlan.student.gradYear - value - 1} - ${CoursePlan.student.gradYear - value}`);
    years.splice(2, 0, CoursePlan.student.gradYear - 3);
    CoursePlan.replaceWithValue(CoursePlan.A1_YEARS, years);
  }

  public static actions = class {
    public static mockup(): GoogleAppsScript.Card_Service.ActionResponse {
      CoursePlan.student = new Student(JSON.parse(TersePropertiesService.getUserProperty(App.PROP_STUDENT)));

      CoursePlan.createSheet();
      CoursePlan.updateHeaders();

      const topLeft = CoursePlan.sheet.getRange(CoursePlan.A1_ENROLLMENT_TOP_LEFT);
      const validation = CoursePlan.sheet.getParent().getSheetByName(CoursePlan.SHEET_DEPTS);
      const numDepartments = validation.getMaxColumns();
      const now = new Date();
      const schoolYear = now.getMonth() > 6 ? now.getFullYear() + 1 : now.getFullYear();
      const values = [];
      const validations = [];
      for (var row = 0; row < numDepartments; row++) {
        const rowValue = [];
        const rowValidation = [];
        for (var column = 0; column < 6; column++) {
          const year = topLeft.offset(-1, column).getValue();
          if ((year.substr ? Number(year.substr(0, 4)) : year) < schoolYear) {
            if (topLeft.offset(-2, column).getValue() == CoursePlan.GRACE) {
              if (row == numDepartments - 1) {
                rowValue.push('=' + s.fcn(s.IFNA,
                  s.fcn(s.JOIN,
                    s.fcn(s.CHAR, 10),
                    s.fcn(s.SORT,
                      s.fcn(s.FILTER,
                        CoursePlan.RANGE_TITLE,
                        s.eq(CoursePlan.RANGE_HOST_ID, CoursePlan.student.hostId),
                        s.eq(CoursePlan.RANGE_DEPT, CoursePlan.GRACE)
                      )
                    )
                  ),
                  '')
                );
              } else {
                rowValue.push('');
              }
            } else {
              const department = topLeft.offset(row, -1).getValue();
              rowValue.push('=' + s.fcn(s.IFNA,
                s.fcn(s.JOIN,
                  s.fcn(s.CHAR, 10),
                  s.fcn(s.INDEX,
                    s.fcn(s.SORT,
                      s.fcn(s.FILTER,
                        `{${CoursePlan.RANGE_TITLE}, ${CoursePlan.RANGE_ORDER}}`,
                        s.eq(CoursePlan.RANGE_HOST_ID, CoursePlan.student.hostId),
                        s.eq(CoursePlan.RANGE_YEAR, year),
                        s.eq(CoursePlan.RANGE_DEPT, department)
                      ),
                      2, true, 1, true), '', 1
                  )
                ),
                ''
              ));
            }
          } else {
            rowValidation.push(SpreadsheetApp.newDataValidation()
              .requireValueInRange(validation.getRange('A2:A').offset(0, row))
              .build());
          }
        }
        values.push(rowValue); // TODO replace with actual values rather than equations
        validations.push(rowValidation);
      }
      topLeft.offset(0, 0, values.length, values[0].length).setValues(values);
      if (validations[0].length) {
        topLeft.offset(0, values[0].length, validations.length, validations[0].length).setDataValidations(validations);
      }

      const numOptions = SheetParameters.getParam(SheetParameters.NUM_OPTIONS_PER_DEPT);
      for (var row = 0; row < numDepartments * numOptions; row += numOptions) {
        CoursePlan.sheet.insertRowsAfter(topLeft.getRow() + row, numOptions - 1);
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

      return TerseCardService.replaceStack(App.cards.error(`Mocked up ${CoursePlan.student.getFormattedName()}`, JSON.stringify(CoursePlan.student, null, 2)));
    }
  }
}

function __CoursePlan_actions_mockup() {
  return CoursePlan.actions.mockup();
}
