import g from '@battis/gas-lighter';
import Role from '../../Role';
import lib from '../../lib';
import CoursePlans from '../CoursePlans';
import Folders from '../Folders';
import StudentFolders from '../StudentFolders';
import Metadata from './/Metadata';

class AdvisorFolder
  extends Folders.Folder
  implements
  lib.Progress.Contextable,
  lib.Progress.Sourceable,
  g.HtmlService.Element.Picker.Pickable {
  public meta: Metadata;

  private _advisor?: Role.Advisor;
  public get advisor() {
    if (!this._advisor) {
      this._advisor = Role.Advisor.get(this.key.toString());
    }
    return this._advisor;
  }

  public resetPermissions() {
    lib.Progress.setStatus('adding advisor as viewer of advisor folder', this); // #reset-advisor-folder-permissions
    g.DriveApp.Permission.add(
      this.id,
      this.key.toString(),
      g.DriveApp.Permission.Role.Reader
    );
  }

  public delete() {
    if (this.driveFolder.getFiles().hasNext()) {
      lib.Progress.setStatus('not empty and will not be deleted', this); // #delete-advisor (1 of 2)
      return;
    }
    lib.Progress.log('moving advisor folder to trash', this); // (2 of 2)
    this.driveFolder.setTrashed(true);
    this.inventory.remove(this.key);
  }

  public contains(
    plan: CoursePlans.CoursePlan
  ): false | GoogleAppsScript.Drive.File;
  public contains(
    studentFolder: StudentFolders.StudentFolder
  ): false | GoogleAppsScript.Drive.File;
  public contains(
    target: CoursePlans.CoursePlan | StudentFolders.StudentFolder
  ) {
    let targetId =
      target instanceof Folders.Folder ? target.id : target.student.folder.id;
    const shortcuts = this.driveFolder.getFilesByType(MimeType.SHORTCUT);
    while (shortcuts.hasNext()) {
      const shortcut = shortcuts.next();
      if (shortcut.getTargetId() == targetId) {
        return shortcut;
      }
    }
    return false;
  }

  public toContext(): { [key: string]: any } {
    return { type: 'advisor folder', key: this.key, id: this.id };
  }

  public toSourceString(): string {
    return this.advisor.formattedName;
  }

  public toOption(): g.HtmlService.Element.Picker.Option {
    return { name: this.advisor.formattedName, value: this.key.toString() };
  }
}

namespace AdvisorFolder { }

export { AdvisorFolder as default };
