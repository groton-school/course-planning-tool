import { Terse } from '@battis/gas-lighter';
import * as Editor from './Editor';

global.onOpen = Editor.onOpen;
global.onInstall = Editor.onInstall;

global.include = Terse.HtmlService.include;
