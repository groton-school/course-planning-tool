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

  public static setCompleteLink({
    message = 'Complete.',
    url = '#',
    actionName = 'Open'
  }: {
    message: string;
    url: string | { [actionName: string]: string };
    actionName?: string;
  }) {
    if (typeof url === 'string') {
      return this.progress.setComplete({
        html: `<div>${message}</div>
                  <div><a id="button" class="btn btn-primary" onclick="google.script.host.close()" href="${url}" target="_blank">${actionName}</a></div>`
      });
    } else {
      let html = `<div>${message}</div>`;
      for (const actionName in url) {
        html = `${html} <div><a id="button" class="btn btn-primary" onclick="google.script.host.close()" href="${url[actionName]}" target="_blank">${actionName}</a></div>`;
      }
      return this.progress.setComplete({
        html
      });
    }
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
