import Role from '../../Role';
import lib from '../../lib';
import Folders from '../Folders';
import FormFoldersOfStudentFolders from '../FormFoldersOfStudentFolders';
import Inventory from './Inventory';
import Metadata from './Metadata';
import g from '@battis/gas-lighter';

class StudentFolder
  extends Folders.Folder
  implements lib.Progress.Contextable, lib.Progress.Sourceable
{
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
      lib.Progress.setStatus(
        'adding advisor as viewer to student folder',
        this
      ); // #reset-student-folder-permissions
      if (this.student.advisor) {
        g.DriveApp.Permission.add(
          this.id,
          this.student.advisor.email,
          g.DriveApp.Permission.Role.Reader
        );
      }
      lib.Progress.setStatus(
        'adding student as viewer to student folder',
        this
      ); // #reset-student-folder-permissions
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
      lib.Progress.setStatus('updating student folder permissions', this, {
        current: this.student.advisor.email,
        previous: this.student.previousAdvisor?.email
      }); // #assign-to-current-advisor
      this.resetPermissions();
      // #assign-to-current-advisor (A: 3)
      if (this.student.previousAdvisor) {
        const shortcut = this.student.previousAdvisor.folder.contains(this);
        if (shortcut) {
          if (this.student.advisor.folder.contains(this)) {
            lib.Progress.setStatus(
              'removing shortcut from previous advisor folder',
              this
            ); // (A: 1 of 3)
            shortcut.setTrashed(true);
          } else {
            lib.Progress.setStatus(
              'moving student folder to current advisor folder',
              this
            ); // (A: 2 of 3)
            shortcut.moveTo(this.student.advisor.folder.driveFolder);
          }
        }
        try {
          this.driveFolder.removeViewer(this.student.previousAdvisor.email);
          lib.Progress.setStatus(
            'removed previous advisor as folder viewer',
            this
          ); // #assign-to-current-advisor (B: 1 of 3)
        } catch (e) {
          lib.Progress.setStatus(
            'prevous advisor was not a folder viewer', // (B: 2 of 3)
            this
          );
        }

        this.meta.permissionsUpdated = true;
      } else if (!this.student.advisor.folder.contains(this)) {
        lib.Progress.setStatus('adding shortcut to advisor folder', this);
        const shortcut = this.student.advisor.folder.driveFolder.createShortcut(
          this.id
        ); // (A: 3 of 3)
        lib.Progress.progress.incrementValue(); // B (3 of 3)
        shortcut.setName(this.student.formattedName);
        this.meta.permissionsUpdated = true;
      }
    }
  }

  public deactivate() {
    if (this.meta.inactive && !this.meta.permissionsUpdated) {
      lib.Progress.setStatus(
        'removing student folder from previous advisor folder',
        this
      ); // #deactivate
      const shortcut = this.student.previousAdvisor.folder.contains(this);
      if (shortcut) {
        shortcut.setTrashed(true);
      }
      try {
        this.driveFolder.removeViewer(this.student.previousAdvisor.email);
        lib.Progress.setStatus(
          'removed previous advisor as student folder viewer',
          this
        ); // #deactivate (1 of 2)
      } catch (e) {
        lib.Progress.setStatus(
          `previous advisor was not a student folder viewer`,
          this
        ); // (2 of 2)
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
    lib.Progress.log('moving student folder to trash', this);
    this.driveFolder.setTrashed(true);
    this.inventory.remove(this.key);
  }

  public toOption(): g.HtmlService.Element.Picker.Option {
    return { name: this.student.formattedName, value: this.key.toString() };
  }

  public toSourceString(): string {
    return (this.student && this.student.formattedName) || this.key.toString();
  }

  public toContext(): { [key: string]: any } {
    return { type: 'student folder', id: this.id, hostId: this.student.hostId };
  }
}

namespace StudentFolder {}

export { StudentFolder as default };
