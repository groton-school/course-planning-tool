import { homeCard } from './Actions/Home';
import Editor from './Editor';

global.launch = () => {
    return homeCard();
};

global.onOpen = Editor.onOpen;
global.onInstall = Editor.onInstall;
