import lib from '../../lib';
import Base from '../Base';

class Metadata extends Base.Metadata {
  public get numOptionsPerDepartment() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.CoursePlans.NumOptionsPerDepartment
    );
  }

  public set numOptionsPerDepartment(numOptionsPerDepartment: number) {
    this.inventory.setMetadata(
      this.k,
      lib.CoursePlanningData.column.CoursePlans.NumOptionsPerDepartment,
      numOptionsPerDepartment
    );
  }

  public get numComments() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.CoursePlans.NumComments
    );
  }

  public set numComments(numComments: number) {
    this.inventory.setMetadata(
      this.k,
      lib.CoursePlanningData.column.CoursePlans.NumComments,
      numComments
    );
  }

  public get inactive() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.CoursePlans.Inactive
    );
  }

  public get newAdvisor() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.CoursePlans.NewAdvisor
    );
  }

  public get permissionsUpdated() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.CoursePlans.PermissionsUpdated
    );
  }

  public set permissionsUpdated(permissionsUpdated: boolean) {
    this.inventory.setMetadata(
      this.k,
      lib.CoursePlanningData.column.CoursePlans.PermissionsUpdated,
      permissionsUpdated
    );
  }

  public get version() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.CoursePlans.Version
    );
  }

  public set version(version: string) {
    this.inventory.setMetadata(
      this.k,
      lib.CoursePlanningData.column.CoursePlans.Version,
      version
    );
  }
}

namespace Metadata { }

export { Metadata as default };
