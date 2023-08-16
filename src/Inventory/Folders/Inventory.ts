import lib from '../../lib';
import Base from '../Base';
import Folder from './Folder';

abstract class Inventory<
  FolderType extends Folder = Folder
> extends Base.Inventory<FolderType> {
  private static readonly ROOT = 'ROOT';

  public constructor(
    sheetName: lib.CoursePlanningData.SheetName,
    formatter: Base.Inventory.Formatter
  ) {
    super(sheetName);
    this.formatter = formatter;
  }

  public get root() {
    return this.get(Inventory.ROOT) as Folder;
  }

  protected formatter = (key: Base.Inventory.Key) => key.toString();

  protected getAsFolder(folderId: string, key?: Base.Inventory.Key) {
    return new Folder(this, folderId, key);
  }

  protected abstract getter(
    folderId: string,
    key?: Base.Inventory.Key
  ): FolderType;

  protected creator(key: Base.Inventory.Key) {
    const folder = this.root.folder.createFolder(this.formatter(key));
    this.add([key, folder.getId(), folder.getUrl()]);
    return new Folder(this, folder.getId(), key) as FolderType;
  }

  public all(): FolderType[] {
    return super.all().filter((folder) => folder.key != Inventory.ROOT);
  }
}

namespace Inventory { }

export { Inventory as default };
