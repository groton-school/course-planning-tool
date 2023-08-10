import Folder from './Folder';
import Inventory from './Inventory';

class Folders extends Inventory<Folder> {
  public constructor(sheetName: string, formatter: Inventory.Formatter) {
    super(sheetName);
    this.formatter = formatter;
  }

  public getRoot = this.get.bind(this, 'ROOT');

  protected formatter = (key: Inventory.Key) => key.toString();

  protected getter = (id: string, key?: Inventory.Key): Folder =>
    new Folder(this, DriveApp.getFolderById(id), key);

  protected creator(key: Inventory.Key): Folder {
    const folder = this.getRoot().folder.createFolder(this.formatter(key));
    this.add([key, folder.getId(), folder.getUrl()]);
    return new Folder(this, folder, key);
  }

  public metadataFor(target: Inventory.Key): Metadata {
    return new Metadata(this, target);
  }
}

export class Metadata extends Inventory.Metadata<Folder> {
  public get folderId() {
    return this.id;
  }
  public get folderUrl() {
    return this.url;
  }
}

namespace Folders {
  export type Key = Inventory.Key;
}

export { Folders as default };
