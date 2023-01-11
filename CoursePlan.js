/** global: State, PropertiesService, TerseCardService */

const CoursePlan = {

  actions: {
    mockup({ parameters: { state } }) {
      State.restore(state);
      State.getSheet().getRange('A1').setValue(`=FILTER('Historical Enrollment'!A:R,'Historical Enrollment'!B:B="${PropertiesService.getUserProperties().getProperty('email')}")`);
      return TerseCardService.replaceStack(App.cards.error('mockup()'));
    }
  },
}

function __CoursePlan_actions_mockup(...args) {
  CoursePlan.actions.mockup(...args);
}
