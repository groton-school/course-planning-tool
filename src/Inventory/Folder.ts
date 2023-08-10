import Inventory from './Inventory';

export default class Folder {
  public constructor(
    protected _inventory: Inventory<Folder>,
    protected _folder: GoogleAppsScript.Drive.Folder,
    protected _key: Inventory.Key
  ) { }

  public meta = this._inventory.metadataFor(this._key);

  public get id() {
    return this.folder.getId();
  }

  public get name() {
    return this.folder.getName();
  }

  public get key() {
    return this._key;
  }

  public get folder() {
    return this._folder;
  }
}
