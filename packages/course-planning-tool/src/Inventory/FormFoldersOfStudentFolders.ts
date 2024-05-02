import lib from '../lib';
import Folders from './Folders';

export default class FormFoldersOfStudentFolders extends Folders.Inventory {
  private static _instance?: FormFoldersOfStudentFolders;
  public static getInstance() {
    if (!this._instance) {
      this._instance = new FormFoldersOfStudentFolders(
        lib.CoursePlanningData.sheet.FoldersFormFolderInventory,
        (gradYear) =>
          lib.Format.apply(lib.Parameters.nameFormat.formFolder, { gradYear })
      );
    }
    return this._instance;
  }

  protected getter = this.getAsFolder;
}
