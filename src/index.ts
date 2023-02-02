import Editor from './Editor';

global.onOpen = Editor.onOpen;
global.onInstall = Editor.onInstall;

// FIXME include() should be in @battis/google-apps-script-helpers
global.include = (filename: string) => {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
};
