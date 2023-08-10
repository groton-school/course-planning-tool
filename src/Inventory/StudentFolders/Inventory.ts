import CoursePlan from '../../CoursePlan';
import Role from '../../Role';
import Base from '../Base';
import Folders from '../Folders';
import StudentFolder from './StudentFolder';

class Inventory extends Folders<StudentFolder> {
  protected creator(hostId: Base.Inventory.Key) {
    const folder = CoursePlan.getFormFolderForStudentFolderFor(
      Role.Student.getByHostId(hostId.toString())
    ).folder.createFolder(this.formatter(hostId));
    this.add([hostId, folder.getId(), folder.getUrl()]);
    return new StudentFolder(this, folder, hostId);
  }

  protected getter = (id: string, key?: Base.Inventory.Key) =>
    new StudentFolder(this, DriveApp.getFolderById(id), key);

  public for(plan: CoursePlan) {
    return this.get(plan.hostId);
  }
}

namespace Inventory { }

export { Inventory as default };
