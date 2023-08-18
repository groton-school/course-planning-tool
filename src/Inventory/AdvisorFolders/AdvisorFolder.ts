import g from '@battis/gas-lighter';
import Role from '../../Role';
import CoursePlans from '../CoursePlans';
import Folders from '../Folders';
import StudentFolders from '../StudentFolders';
import Metadata from './/Metadata';

class AdvisorFolder extends Folders.Folder {
  public meta: Metadata;

  private _advisor?: Role.Advisor;
  public get advisor() {
    if (!this._advisor) {
      this._advisor = Role.Advisor.get(this.key.toString());
    }
    return this._advisor;
  }

  public resetPermissions() {
    g.DriveApp.Permission.add(
      this.id,
      this.key.toString(),
      g.DriveApp.Permission.Role.Reader
    );
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
    for (
      let shortcut: GoogleAppsScript.Drive.File;
      shortcuts.hasNext();
      shortcut = shortcuts.next()
    ) {
      if (shortcut.getTargetId() == targetId) {
        return shortcut;
      }
    }
    return false;
  }
}

namespace AdvisorFolder { }

export { AdvisorFolder as default };
