/** global: App, TersePropertiesService, TerseCardService, SpreadsheetApp */

const CoursePlan = {

  actions: {
    mockup() {
      const spreadsheet = SpreadsheetApp.getActive();
      spreadsheet.deleteSheet(spreadsheet.getSheetByName('Mockup'));
      var sheet = spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Template'));
      sheet = spreadsheet.duplicateActiveSheet();
      sheet.setName('Mockup');
      const email = TersePropertiesService.getUserProperty('email');
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

      replaceWithValue('A3:E3', `=INDEX('Advisor List'!A:E,MATCH("${email}",'Advisor List'!B:B,0),0)`);
      const [[hostId, , firstName, lastName, gradYear]] = sheet.getRange('A3:E3').getValues();
      sheet.getRange('A3:E3').clear();

      replaceWithValue('A1', `${firstName} ${lastName} '${gradYear - 2000}`);
      replaceWithValue('A2', `="Advisor: "&JOIN(" ",INDEX('Advisor List'!G:H,MATCH("${hostId}",'Advisor List'!A:A,0),0))`);
      replaceWithValue('B5:G5', `=ARRAYFORMULA(SEQUENCE(1,${numYears},${gradYear - 5}, 1)&" - "&SEQUENCE(1,${numYears},${gradYear - 4},1))`);
      replaceWithValue('E5:G5', sheet.getRange('D5:F5').getValues());
      replaceWithValue('D5', sheet.getRange('D5').getValue().substr(0, 4));

      const topLeft = sheet.getRange('B6');
      const validation = sheet.getParent().getSheetByName('Courses by Department');
      const numDepartments = validation.getMaxColumns();
      for (var row = 0; row < numDepartments; row++) {
        for (var column = 0; column < numYears + 1; column++) {
          if (topLeft.offset(-2, column).getValue() == 'GRACE') {
            if (row == numDepartments - 1) {
              replaceWithValue(topLeft.offset(row, column).getA1Notation(), `=IFNA(JOIN(CHAR(10),FILTER('Historical Enrollment'!Q:Q, 'Historical Enrollment'!B:B="${email}",'Historical Enrollment'!P:P="GRACE")),)`)
            }
          } else {
            const year = topLeft.offset(-1, column).getValue();
            if (Number(year.substr(0, 4)) < new Date().getFullYear()) {
              const department = topLeft.offset(row, -1).getValue();
              replaceWithValue(topLeft.offset(row, column).getA1Notation(), `=IFNA(JOIN(CHAR(10),UNIQUE(FILTER('Historical Enrollment'!Q:Q&IF('Historical Enrollment'!R:R<>""," ("&'Historical Enrollment'!R:R&")",""),'Historical Enrollment'!B:B="${email}",'Historical Enrollment'!G:G="${year}",'Historical Enrollment'!P:P="${department}"))),)`);
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

      return TerseCardService.replaceStack(App.cards.error(`Mocked up ${firstName} ${lastName}`, JSON.stringify({
        hostId: hostId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        gradYear: gradYear
      }, null, 2)));
    }
  },
}

function __CoursePlan_actions_mockup(...args) {
  return CoursePlan.actions.mockup(...args);
}
