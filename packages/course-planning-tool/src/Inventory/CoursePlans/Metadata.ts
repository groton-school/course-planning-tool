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

  public get inactive() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.CoursePlans.Inactive
    );
  }
  public get active() {
    return !this.inactive;
  }

  public get newAdvisor() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.CoursePlans.NewAdvisor
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

  public get incomplete() {
    return this.inventory.getMetadata(
      this.k,
      lib.CoursePlanningData.column.CoursePlans.Incomplete
    );
  }

  public set incomplete(incomplete: boolean) {
    this.inventory.setMetadata(
      this.k,
      lib.CoursePlanningData.column.CoursePlans.Incomplete,
      incomplete
    );
  }
}

namespace Metadata { }

export { Metadata as default };
