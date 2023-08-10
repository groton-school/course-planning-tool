import Inventory from './Inventory';
import MMetadata from './Metadata';
import MStudentFolder from './StudentFolder';

class StudentFolders extends Inventory { }

namespace StudentFolders {
  export import StudentFolder = MStudentFolder;
  export import Metadata = MMetadata;
}

export { StudentFolders as default };
