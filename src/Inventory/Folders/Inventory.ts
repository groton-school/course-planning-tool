import lib from '../../lib';
import Base from '../Base';
import Folder from './Folder';

class Inventory<
  FolderType extends Folder = Folder
> extends Base.Inventory<FolderType> {
  public constructor(
    sheetName: lib.CoursePlanningData.SheetName,
    formatter: Base.Inventory.Formatter
  ) {
    super(sheetName);
    this.formatter = formatter;
  }

  public get root() {
    return this.get('ROOT') as Folder;
  }

  protected formatter = (key: Base.Inventory.Key) => key.toString();

  protected getter(id: string, key?: Base.Inventory.Key) {
    return new Folder(this, DriveApp.getFolderById(id), key);
  }

  protected creator(key: Base.Inventory.Key) {
    const folder = this.root.folder.createFolder(this.formatter(key));
    this.add([key, folder.getId(), folder.getUrl()]);
    return new Folder(this, folder, key) as FolderType;
  }
}

namespace Inventory { }

export { Inventory as default };
