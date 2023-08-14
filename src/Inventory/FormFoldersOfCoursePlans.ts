import lib from '../lib';
import Folders from './Folders';

export default class FormFoldersOfCoursePlans extends Folders.Inventory {
  private static _instance?: FormFoldersOfCoursePlans;
  public static getInstance() {
    if (!this._instance) {
      this._instance = new FormFoldersOfCoursePlans();
    }
    return this._instance;
  }

  private constructor() {
    super(lib.CoursePlanningData.sheet.PlansFormFolderInventory, (gradYear) =>
      lib.format.apply(lib.config.getFormFolderNameFormat(), {
        gradYear
      })
    );
  }
}
