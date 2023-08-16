import g from '@battis/gas-lighter';
import Role from '../../Role';
import lib from '../../lib';
import Base from '../Base';
import Folders from '../Folders';
import FormFoldersOfStudentFolders from '../FormFoldersOfStudentFolders';
import Inventory from './Inventory';
import Metadata from './Metadata';

class StudentFolder
  extends Folders.Folder
  implements lib.Progress.Contextable, lib.Progress.Sourceable {
  public constructor(
    inventory: Inventory,
    folderId: string,
    hostId: Base.Inventory.Key
  ) {
    super(inventory, folderId, hostId);
  }

  public meta = new Metadata(this.inventory as Inventory, this.key);

  private _student?: Role.Student;
  public get student() {
    if (!this._student) {
      this._student = Role.Student.getByHostId(this.key.toString());
    }
    return this._student;
  }

  public get studentFolder() {
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

  public resetPermissions() {
    if (this.meta.active) {
      g.DriveApp.Permission.add(
        this.studentFolder.getId(),
        this.student.advisor.email,
        g.DriveApp.Permission.Role.Reader
      );
      g.DriveApp.Permission.add(
        this.studentFolder.getId(),
        this.student.email,
        g.DriveApp.Permission.Role.Reader
      );
    }
  }

  public assignToCurrentAdvisor(previousAdvisor?: Role.Advisor) {
    const primary = !previousAdvisor;
    previousAdvisor =
      previousAdvisor || this.student.getAdvisor(Role.Year.Previous);
    if (this.meta.newAdvisor && !this.meta.permissionsUpdated) {
      lib.Progress.setStatus('updating student folder permissions', this, {
        current: this.student.advisor.email,
        previous: previousAdvisor.email
      }); // #reassign
      this.resetPermissions();
      const shortcuts = previousAdvisor.folder.getFilesByType(
        MimeType.SHORTCUT
      );

      lib.Progress.setStatus(
        'moving student folder to current advisor folder',
        this
      ); // #reassign
      while (shortcuts.hasNext()) {
        const shortcut = shortcuts.next();
        if (shortcut.getTargetId() === this.studentFolder.getId()) {
          shortcut.moveTo(this.student.advisor.folder);
        }
      }
      try {
        this.studentFolder.removeViewer(previousAdvisor.email);
      } catch (e) {
        lib.Progress.log(
          `${previousAdvisor.email} as not a student folder viewer`,
          this
        );
      }

      this.meta.permissionsUpdated = true;
    }
    if (primary) {
      this.student.plan.assignToCurrentAdvisor(previousAdvisor);
    }
  }

  public makeInactive(previousAdvisor?: Role.Advisor) {
    const primary = !previousAdvisor;
    previousAdvisor =
      previousAdvisor || this.student.getAdvisor(Role.Year.Previous);
    if (this.meta.inactive && !this.meta.permissionsUpdated) {
      const shortcuts = previousAdvisor.folder.getFilesByType(
        MimeType.SHORTCUT
      );
      lib.Progress.setStatus(
        'removing student folder from previous advisor folder',
        this
      ); // #inactive
      while (shortcuts.hasNext()) {
        const shortcut = shortcuts.next();
        if (shortcut.getTargetId() === this.studentFolder.getId()) {
          shortcut.setTrashed(true);
        }
      }
      try {
        this.studentFolder.removeViewer(previousAdvisor.email);
      } catch (e) {
        lib.Progress.log(
          `${previousAdvisor.email} was not a student folder viewer`,
          this
        );
      }

      this.meta.permissionsUpdated = true;
    }
    if (primary) {
      this.student.plan.makeInactive(previousAdvisor);
    }
  }

  public toSourceString(): string {
    return this.student.getFormattedName();
  }

  public toContext(): { [key: string]: any } {
    return { type: 'student folder', id: this.id, hostId: this.student.hostId };
  }
}

namespace StudentFolder { }

export { StudentFolder as default };
