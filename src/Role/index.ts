import MAdvisor from './Advisor';
import MStudent from './Student';
import MYear from './Year';

namespace Role {
  export import Advisor = MAdvisor;
  export import Student = MStudent;
  export import Year = MYear;
}

export { Role as default };
