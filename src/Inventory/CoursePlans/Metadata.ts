import Base from '../Base';

class Metadata extends Base.Metadata {
  public get numOptionsPerDepartment() {
    return this.inventory.getMetadata(this.k, 14);
  }

  public set numOptionsPerDepartment(numOptionsPerDepartment: number) {
    this.inventory.setMetadata(this.k, 14, numOptionsPerDepartment);
  }

  public get numComments() {
    return this.inventory.getMetadata(this.k, 15);
  }

  public set numComments(numComments: number) {
    this.inventory.setMetadata(this.k, 15, numComments);
  }

  public get newAdvisor() {
    return this.inventory.getMetadata(this.k, 17);
  }

  public get permissionsUpdated() {
    return this.inventory.getMetadata(this.k, 18);
  }

  public set permissionsUpdated(permissionsUpdated: boolean) {
    this.inventory.setMetadata(this.k, 18, permissionsUpdated);
  }

  public get version() {
    return this.inventory.getMetadata(this.k, 19);
  }

  public set version(version: string) {
    this.inventory.setMetadata(this.k, 19, version);
  }
}

namespace Metadata { }

export { Metadata as default };
