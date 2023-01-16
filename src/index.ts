import App from './App';
import CoursePlan from './CoursePlan';

global.__App_launch = () => {
    return App.launch();
};

global.__App_handlers_emailChange = (event) => {
    return App.handlers.emailChange(event);
};

global.__App_actions_home = () => {
    return App.actions.home();
};

global.__CoursePlan_actions_mockup = () => {
    return CoursePlan.actions.mockup();
};
