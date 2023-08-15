import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import Role from '../Role';

class Progress {
  private constructor() { }

  private static _progress = g.HtmlService.Element.Progress.bindTo(
    Utilities.getUuid()
  );
  public static get progress() {
    return this._progress;
  }

  public static setThread(thread = Utilities.getUuid()) {
    this._progress = g.HtmlService.Element.Progress.bindTo(thread);
  }

  public static reset() {
    return this.progress.reset();
  }

  public static showModalDialog(
    root: g.UI.Dialog.Root,
    title: string,
    height?: number
  ) {
    return this.progress.showModalDialog(root, title, height);
  }

  public static getHtmlOutput(height?: number) {
    return this.progress.getHtmlOutput(height);
  }

  public static getHtml() {
    return this.progress.getHtml();
  }

  public static setMax(max: number) {
    return this.progress.setMax(max);
  }

  public static setComplete(
    completion: g.HtmlService.Element.Progress.Completion
  ) {
    return this.progress.setComplete(completion);
  }

  public static setStatus(message: string): void;
  public static setStatus(
    message: string,
    plan: Inventory.Module.CoursePlans.CoursePlan
  ): void;
  public static setStatus(message: string, student: Role.Student): void;
  public static setStatus(message: string, source?: object): void {
    if (source instanceof Role.Student) {
      this.progress.setStatus(`${source.getFormattedName()} (${message})`);
    } else if (source instanceof Inventory.Module.CoursePlans.CoursePlan) {
      this.progress.setStatus(
        `${source.student.getFormattedName()} (${message})`
      );
    } else {
      this.progress.setStatus(message);
    }
    this.progress.incrementValue();
  }
}

namespace Progress { }

export { Progress as default };
