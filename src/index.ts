import { Terse } from '@battis/gas-lighter';
import * as AddOn from './AddOn';

// Editor add-on hooks
global.onOpen = AddOn.onOpen;
global.onInstall = AddOn.onInstall;

// helper functions
global.include = Terse.HtmlService.include;
global.getProgress = (thread: string) =>
    Terse.HtmlService.Element.Progress.getProgress(thread);
