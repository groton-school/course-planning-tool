/** global: SpreadsheetApp */

const State = {
  email: null,
  spreadsheet: null,
  sheet: null,

  _spreadsheet: null,
  _sheet: null,

  getEmail() {
    return State.email;
  },

  setEmail(email) {
    State.email = email;
  },

  getSpreadsheet() {
    if (State.spreadsheet) {
      if (!State._spreadsheet) {
        State._spreadsheet = SpreadsheetApp.openById(State.spreadsheet);
      }
      return State._spreadsheet;
    }
    return null;
  },

  setSpreadsheet(spreadsheet) {
    State._spreadsheet = spreadsheet;
    State.spreadsheet = spreadsheet.getId();
  },

  getSheet() {
    if (State.sheet && State.spreadsheet) {
      if (!State._sheet) {
        State._sheet = State.getSpreadsheet().getSheetByName(
          State.sheet
        );
      }
      return State._sheet;
    }
    return null;
  },

  setSheet(sheet) {
    State._sheet = sheet;
    State.sheet = sheet.getName();
    State.setSpreadsheet(sheet.getParent());
  },

  reset: (serializedState = null) => {
    const previousState = serializedState && JSON.parse(serializedState);
    if (previousState) {
      for (const key of Object.keys(previousState)) {
        State[key] = previousState[key];
      }
    }
  },

  restore: serializedState => {
    return State.reset(serializedState);
  },

  toJSON: stateChanges => {
    if (stateChanges) {
      for (const key of Object.keys(stateChanges)) {
        const value = stateChanges[key];
        switch (key) {
          case 'spreadsheet':
            State.setSpreadsheet(value);
            break;
          case 'sheet':
            State.setSheet(value);
            break;
          default:
            State[key] = stateChanges[key];
        }
      }
    }

    return JSON.stringify({
      email: State.email,
      spreadsheet: State.spreadsheet,
      sheet: State.sheet,
    });
  },
};
