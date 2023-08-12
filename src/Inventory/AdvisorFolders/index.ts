import lib from '../../lib';
import Role from '../../Role';
import MAdvisorFolder from './AdvisorFolder';
import Inventory from './Inventory';
import MMetadata from './Metadata';

class AdvisorFolders extends Inventory {
  private static _instance?: AdvisorFolders;
  public static getInstance(): AdvisorFolders {
    if (!this._instance) {
      this._instance = new AdvisorFolders(
        lib.CoursePlanningData.sheet.AdvisorFolderInventory,
        (email) =>
          lib.format.apply(
            lib.config.getAdvisorFolderNameFormat(),
            Role.Advisor.getByEmail(email.toString())
          )
      );
    }
    return this._instance;
  }
}

namespace AdvisorFolders {
  export import AdvisorFolder = MAdvisorFolder;
  export import Metadata = MMetadata;
}

export { AdvisorFolders as default };
