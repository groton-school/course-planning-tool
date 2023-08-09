import MAdvisor from './Advisor';
import MStudent from './Student';

namespace Role {
  export import Advisor = MAdvisor;
  export import Student = MStudent;
}

export { Role as default };
