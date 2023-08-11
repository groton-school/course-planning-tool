import g from '@battis/gas-lighter';
import semverLt from 'semver/functions/lt';
import Inventories from '..';
import CoursePlan from '../../CoursePlan';
import lib from '../../lib';
import Role from '../../Role';
import Base from '../Base';
import Folders from '../Folders';
import StudentFolder from './StudentFolder';

class Inventory extends Folders<StudentFolder> {
  protected creator(hostId: Base.Inventory.Key) {
    const student = Role.Student.getByHostId(hostId.toString());
    const folder = Inventories.FormFoldersOfStudentFolders.get(
      student.gradYear
    ).folder.createFolder(this.formatter(hostId));
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
    const { plan } = Inventories.CoursePlans.get(hostId);
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
    if (item.meta.newAdvisor && !item.meta.permissionsUpdated) {
      this.updateStudentFolderPermissions(item);
    }
    return item;
  }

  private updateStudentFolderPermissions(item: StudentFolder) {
    const previousAdvisor = item.student.getAdvisor(
      Role.Advisor.ByYear.Previous
    );
    const { studentFolder } = item;
    g.DriveApp.Permission.add(
      studentFolder.getId(),
      item.student.advisor.email,
      g.DriveApp.Permission.Role.Reader
    );
    const shortcuts = previousAdvisor.folder.getFilesByType(MimeType.SHORTCUT);
    while (shortcuts.hasNext()) {
      const shortcut = shortcuts.next();
      if (shortcut.getTargetId() === studentFolder.getId()) {
        shortcut.moveTo(item.student.advisor.folder);
      }
    }
    studentFolder.removeViewer(previousAdvisor.email);
    item.meta.permissionsUpdated = true;
  }

  public for(plan: CoursePlan) {
    return this.get(plan.hostId);
  }
}

namespace Inventory { }

export { Inventory as default };
