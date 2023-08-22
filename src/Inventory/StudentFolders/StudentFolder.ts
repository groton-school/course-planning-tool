import g from '@battis/gas-lighter';
import Role from '../../Role';
import lib from '../../lib';
import Folders from '../Folders';
import FormFoldersOfStudentFolders from '../FormFoldersOfStudentFolders';
import Inventory from './Inventory';
import Metadata from './Metadata';

class StudentFolder
  extends Folders.Folder
  implements lib.Progress.Contextable, lib.Progress.Sourceable {
  public meta = new Metadata(this.inventory as Inventory, this.key);

  private _student?: Role.Student;
  public get student() {
    if (!this._student) {
      this._student = Role.Student.get(this.key.toString());
    }
    return this._student;
  }

  private _formFolder?: Folders.Folder;
  public get formFolder() {
    if (!this._formFolder) {
      this._formFolder = FormFoldersOfStudentFolders.getInstance().get(
        this.student.gradYear
      );
    }
    return this._formFolder;
  }

  public resetPermissions() {
    if (this.meta.active) {
      if (this.student.advisor) {
        g.DriveApp.Permission.add(
          this.id,
          this.student.advisor.email,
          g.DriveApp.Permission.Role.Reader
        );
      }
      g.DriveApp.Permission.add(
        this.id,
        this.student.email,
        g.DriveApp.Permission.Role.Reader
      );
    }
  }

  public assignToCurrentAdvisor() {
    if (
      this.meta.newAdvisor &&
      !this.meta.permissionsUpdated &&
      this.student.advisor
    ) {
      lib.Progress.log('updating student folder permissions', this, {
        current: this.student.advisor.email,
        previous: this.student.previousAdvisor.email
      });
      this.resetPermissions();

      lib.Progress.log('moving student folder to current advisor folder', this);
      const shortcut = this.student.previousAdvisor?.folder.contains(this);
      if (shortcut) {
        shortcut.moveTo(this.student.advisor.folder.driveFolder);
      }
      try {
        this.driveFolder.removeViewer(this.student.previousAdvisor.email);
      } catch (e) {
        lib.Progress.log(
          `${this.student.previousAdvisor.email} was not a student folder viewer`,
          this
        );
      }

      this.meta.permissionsUpdated = true;
    } else if (
      this.student.advisor &&
      !this.student.advisor.folder.contains(this)
    ) {
      const shortcut = this.student.advisor.folder.driveFolder.createShortcut(
        this.id
      );
      shortcut.setName(this.student.formattedName);
    }
  }

  public deactivate() {
    if (this.meta.inactive && !this.meta.permissionsUpdated) {
      lib.Progress.log(
        'removing student folder from previous advisor folder',
        this
      );
      const shortcut = this.student.advisor.folder.contains(this);
      if (shortcut) {
        shortcut.setTrashed(true);
      }
      try {
        this.driveFolder.removeViewer(this.student.previousAdvisor.email);
      } catch (e) {
        lib.Progress.log(
          `${this.student.previousAdvisor.email} was not a student folder viewer`,
          this
        );
      }
      this.meta.permissionsUpdated = true;
    }
  }

  public resetName() {
    const oldName = this.driveFolder.getName();
    const newName = lib.Format.apply(
      lib.Parameters.nameFormat.studentFolder,
      this.student
    );
    if (oldName != newName) {
      lib.Progress.setStatus(
        `Renaming '${this.driveFolder.getName()}' to '${newName}'`
      );
      this.driveFolder.setName(newName);
    } else {
      lib.Progress.progress.incrementValue();
    }
  }

  public delete() {
    if (this.student.advisor?.folder.contains(this)) {
      const shortcut = this.student.advisor.folder.contains(this);
      if (shortcut) {
        shortcut.setTrashed(true);
      }
    }
    this.driveFolder.setTrashed(true);
    lib.Progress.log('moving student folder to trash', this);
    this.inventory.remove(this.key);
  }

  public toOption(): g.HtmlService.Element.Picker.Option {
    return { name: this.student.formattedName, value: this.key.toString() };
  }

  public toSourceString(): string {
    return this.student.formattedName;
  }

  public toContext(): { [key: string]: any } {
    return { type: 'student folder', id: this.id, hostId: this.student.hostId };
  }
}

namespace StudentFolder { }

export { StudentFolder as default };
