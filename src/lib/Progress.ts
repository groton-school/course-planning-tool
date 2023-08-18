import g from '@battis/gas-lighter';

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

  public static log(
    message: any,
    context?: Partial<Progress.Contextable>,
    additionalContext: { [key: string]: any } = {}
  ) {
    Logger.log({
      message,
      context: {
        thread: this.progress.getThread(),
        ...(Progress.Contextable.isContextable(context)
          ? context.toContext()
          : {}),
        ...additionalContext
      }
    });
  }

  public static setStatus(
    message: string,
    source?: Progress.Sourceable & Partial<Progress.Contextable>,
    additionalContext: { [key: string]: any } = {}
  ): void {
    if (source) {
      message = `${source.toSourceString()} (${message})`;
    }
    this.log(message, source, additionalContext);
    this.progress.setStatus(message);

    this.progress.incrementValue();
  }
}

namespace Progress {
  export interface Sourceable {
    toSourceString(): string;
  }
  export interface Contextable {
    toContext(): { [key: string]: any };
  }
  export namespace Contextable {
    export function isContextable(obj?: object): obj is Progress.Contextable {
      return obj && 'toContext' in obj && typeof obj.toContext === 'function';
    }
  }
}

export { Progress as default };
