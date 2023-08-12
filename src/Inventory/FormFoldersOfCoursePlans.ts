import lib from '../lib';
import Folders from './Folders';

export default class FormFoldersOfCoursePlans {
  private constructor() { }

  private static _instance?: Folders;
  public static getInstance() {
    if (!this._instance) {
      this._instance = new Folders(
        lib.CoursePlanningData.sheet.PlansFormFolderInventory,
        (gradYear) =>
          lib.format.apply(lib.config.getFormFolderNameFormat(), {
            gradYear
          })
      );
    }
    return this._instance;
  }
}
