import MInventory from './Inventory';
import MMetadata from './Metadata';
import MStudentFolder from './StudentFolder';

namespace StudentFolders {
  export import Inventory = MInventory;
  export import StudentFolder = MStudentFolder;
  export import Metadata = MMetadata;
}

export default StudentFolders;
