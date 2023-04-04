import g from '@battis/gas-lighter';
import * as AddOn from './AddOn';

// Editor add-on hooks
global.onOpen = AddOn.onOpen;
global.onInstall = AddOn.onInstall;

// helper functions
global.include = g.HtmlService.include;
global.getProgress = (thread: string) =>
  g.HtmlService.Element.Progress.getProgress(thread);
