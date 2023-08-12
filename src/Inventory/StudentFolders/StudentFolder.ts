import g from '@battis/gas-lighter';
import Role from '../../Role';
import Base from '../Base';
import Folders from '../Folders';
import FormFoldersOfStudentFolders from '../FormFoldersOfStudentFolders';
import Inventory from './Inventory';
import Metadata from './Metadata';

class StudentFolder extends Folders.Folder {
  public constructor(
    inventory: Inventory,
    studentFolder: GoogleAppsScript.Drive.Folder,
    hostId: Base.Inventory.Key
  ) {
    super(inventory, studentFolder, hostId);
  }

  public meta = new Metadata(this.inventory as Inventory, this.key);

  private _student?: Role.Student;
  public get student() {
    if (!this._student) {
      this._student = Role.Student.getByHostId(this.key.toString());
    }
    return this._student;
  }

  public get studentFolder(): GoogleAppsScript.Drive.Folder {
    return this.folder;
  }

  private _formFolder?: GoogleAppsScript.Drive.Folder;
  public get formFolder() {
    if (!this._formFolder) {
      this._formFolder = FormFoldersOfStudentFolders.getInstance().get(
        this.student.gradYear
      ).folder;
    }
    return this._formFolder;
  }

  public assignToCurrentAdvisor(primary = true) {
    const previousAdvisor = this.student.getAdvisor(
      Role.Advisor.ByYear.Previous
    );
    g.DriveApp.Permission.add(
      this.studentFolder.getId(),
      this.student.advisor.email,
      g.DriveApp.Permission.Role.Reader
    );
    const shortcuts = previousAdvisor.folder.getFilesByType(MimeType.SHORTCUT);
    while (shortcuts.hasNext()) {
      const shortcut = shortcuts.next();
      if (shortcut.getTargetId() === this.studentFolder.getId()) {
        shortcut.moveTo(this.student.advisor.folder);
      }
    }
    this.studentFolder.removeViewer(previousAdvisor.email);

    this.meta.permissionsUpdated = true;
    if (primary) {
      this.student.plan.assignToCurrentAdvisor(false);
    }
  }

  public makeInactive(primary = true) {
    const previousAdvisor = this.student.getAdvisor(
      Role.Advisor.ByYear.Previous
    );
    const shortcuts = previousAdvisor.folder.getFilesByType(MimeType.SHORTCUT);
    while (shortcuts.hasNext()) {
      const shortcut = shortcuts.next();
      if (shortcut.getTargetId() === this.studentFolder.getId()) {
        shortcut.setTrashed(true);
      }
    }
    this.studentFolder.removeViewer(previousAdvisor.email);

    this.meta.permissionsUpdated = true;
    if (primary) {
      this.student.plan.makeInactive(false);
    }
  }
}

namespace StudentFolder { }

export { StudentFolder as default };
