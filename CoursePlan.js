/** global: App, TersePropertiesService, TerseCardService */

const CoursePlan = {

  actions: {
    mockup() {
      const sheet = SpreadsheetApp.getActive().getSheetByName('Mockup');
      sheet.getRange('A1').setValue(`=FILTER('Historical Enrollment'!A:R,'Historical Enrollment'!B:B="${TersePropertiesService.getUserProperty('email')}")`);
      return TerseCardService.replaceStack(App.cards.error('mockup()'));
    }
  },
}

function __CoursePlan_actions_mockup(...args) {
  CoursePlan.actions.mockup(...args);
}
