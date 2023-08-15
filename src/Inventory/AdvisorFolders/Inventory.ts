import lib from '../../lib';
import Role from '../../Role';
import Base from '../Base';
import Folders from '../Folders';
import AdvisorFolder from './AdvisorFolder';

class Inventory extends Folders.Inventory<AdvisorFolder> {
  private static _instance?: Inventory;
  public static getInstance() {
    if (!this._instance) {
      this._instance = new Inventory();
    }
    return this._instance;
  }

  private constructor() {
    super(lib.CoursePlanningData.sheet.AdvisorFolderInventory, (email) =>
      lib.Format.apply(
        lib.Config.getAdvisorFolderNameFormat(),
        Role.Advisor.getByEmail(email.toString())
      )
    );
  }

  protected creator(key: Base.Inventory.Key): AdvisorFolder {
    const folder = this.root.folder.createFolder(this.formatter(key));
    this.add([key, folder.getId(), folder.getUrl()]);
    return new AdvisorFolder(this, folder.getId(), key);
  }
}

namespace Inventory { }

export { Inventory as default };
