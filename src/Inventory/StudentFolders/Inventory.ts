import g from '@battis/gas-lighter';
import semverLt from 'semver/functions/lt';
import lib from '../../lib';
import Role from '../../Role';
import Base from '../Base';
import CoursePlans from '../CoursePlans';
import CoursePlan from '../CoursePlans/CoursePlan';
import Folders from '../Folders';
import FormFoldersOfStudentFolders from '../FormFoldersOfStudentFolders';
import StudentFolder from './StudentFolder';

class Inventory extends Folders<StudentFolder> {
  protected creator(hostId: Base.Inventory.Key) {
    const student = Role.Student.getByHostId(hostId.toString());
    const folder = FormFoldersOfStudentFolders.getInstance()
      .get(student.gradYear)
      .folder.createFolder(this.formatter(hostId));
    this.add([hostId, folder.getId(), folder.getUrl()]);

    return new StudentFolder(this, folder, hostId);
  }

  public putInPlace(plan: CoursePlan, thread = Utilities.getUuid()) {
    g.HtmlService.Element.Progress.setStatus(
      thread,
      `${plan.student.getFormattedName()} (filing in student folder)`
    );
    const creating = !this.has(plan.hostId);
    const { studentFolder } = this.for(plan);
    studentFolder.createShortcut(plan.file.getId());
    if (creating) {
      plan.advisor.folder.createShortcut(studentFolder.getId());
    }
    g.DriveApp.Permission.add(
      studentFolder.getId(),
      plan.student.email,
      g.DriveApp.Permission.Role.Reader
    );
    g.DriveApp.Permission.add(
      studentFolder.getId(),
      plan.advisor.email,
      g.DriveApp.Permission.Role.Reader
    );
  }

  public createStudentFolderIfMissing(
    hostId: Base.Inventory.Key,
    thread = Utilities.getUuid()
  ) {
    const plan = CoursePlans.getInstance().get(hostId);
    if (semverLt(plan.meta.version, '0.2.1')) {
      if (!this.has(hostId)) {
        g.HtmlService.Element.Progress.setStatus(
          thread,
          `${plan.student.getFormattedName()} (replacing plan shortcut with folder shortcut in advisor folder)`
        );
        const { folder } = this.creator(hostId);
        const shortcuts = folder.getFilesByName(
          lib.format.apply(lib.config.getCoursePlanNameFormat(), plan.student)
        );
        while (shortcuts.hasNext()) {
          shortcuts.next().setTrashed(true);
        }
        plan.advisor.folder.createShortcut(folder.getId());
      }
    }
  }

  protected getter(id: string, key?: Base.Inventory.Key) {
    const item = new StudentFolder(this, DriveApp.getFolderById(id), key);
    if (!item.meta.permissionsUpdated) {
      if (item.meta.newAdvisor) {
        item.assignToCurrentAdvisor();
      }
      if (item.meta.inactive) {
        item.makeInactive();
      }
    }
    return item;
  }

  public for(plan: CoursePlan) {
    return this.get(plan.hostId);
  }

  public refresh = (hostId: Base.Inventory.Key) => {
    this.get(hostId);
  };
}

namespace Inventory {
  export namespace createStudentFolderIfMissing {
    export const enabled = semverLt(
      CoursePlans.getInstance().minVersion,
      '0.2.1'
    );
  }
}

export { Inventory as default };
