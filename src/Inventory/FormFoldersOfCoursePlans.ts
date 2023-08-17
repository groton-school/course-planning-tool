import lib from '../lib';
import Base from './Base';
import Folders from './Folders';

export default class FormFoldersOfCoursePlans extends Folders.Inventory {
  private static _instance?: FormFoldersOfCoursePlans;
  public static getInstance() {
    if (!this._instance) {
      this._instance = new FormFoldersOfCoursePlans(
        lib.CoursePlanningData.sheet.PlansFormFolderInventory,
        (gradYear: Base.Inventory.Key) =>
          lib.Format.apply(lib.Parameters.nameFormat.formFolder, { gradYear })
      );
    }
    return this._instance;
  }

  protected getter = this.getAsFolder;
}
