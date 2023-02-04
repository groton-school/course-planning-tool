import Editor from './Editor';
import { Terse } from '@battis/gas-lighter';

global.onOpen = Editor.onOpen;
global.onInstall = Editor.onInstall;

global.include = Terse.HtmlService.include;
