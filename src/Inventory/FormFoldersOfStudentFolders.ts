import lib from '../lib';
import Folders from './Folders';

export default class FormFoldersOfStudentFolders extends Folders.Inventory {
  private static _instance?: FormFoldersOfStudentFolders;
  public static getInstance() {
    if (!this._instance) {
      this._instance = new FormFoldersOfStudentFolders();
    }
    return this._instance;
  }

  protected getter = this.getAsFolder;

  private constructor() {
    super(lib.CoursePlanningData.sheet.FoldersFormFolderInventory, (gradYear) =>
      lib.Format.apply(lib.Config.getFormFolderNameFormat(), {
        gradYear
      })
    );
  }
}
