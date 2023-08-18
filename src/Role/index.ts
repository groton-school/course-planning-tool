import MAdvisor from './Advisor';
import MForm from './Form';
import MStudent from './Student';

namespace Role {
  export import Advisor = MAdvisor;
  export import Student = MStudent;
  export import Form = MForm;
}

export { Role as default };
