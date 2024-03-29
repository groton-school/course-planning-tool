import g from '@battis/gas-lighter';
import Inventory from '../Inventory';
import lib from '../lib';

export const allStudentFolders = () => 'fr_asf';
const fr_asf: g.HtmlService.Element.Picker.OptionsCallback = () =>
  Inventory.StudentFolders.all()
    .filter((folder) => folder.meta.active)
    .map((folder) => folder.toOption())
    .sort();
global.fr_asf = fr_asf;

export const pickStudentFolderToRename = () => 'fr_psftr';
global.fr_psftr = () =>
  g.HtmlService.Element.Picker.showModalDialog(
    SpreadsheetApp,
    {
      message: 'Please select a student folder to rename',
      actionName: 'Rename',
      list: allStudentFolders(),
      callback: renameStudentFolder()
    },
    'Rename Student Folder'
  );

export const renameStudentFolder = () => 'fr_rsf';
global.fr_rsf = (hostId: string, thread: string) => {
  lib.Progress.setThread(thread);
  const studentFolder = Inventory.StudentFolders.get(hostId);
  studentFolder.resetName();
  lib.Progress.setCompleteLink({
    message: `${studentFolder.driveFolder.getName()} renamed.`,
    url: studentFolder.url
  });
};

export const renameAllStudentFolders = () => 'fr_rasf';
global.fr_rasf = (thread = Utilities.getUuid(), step = 0) => {
  lib.Progress.setThread(thread);
  new g.HtmlService.Element.Progress.Paged(
    thread,
    { root: SpreadsheetApp, title: 'Rename Studnt Folders' },
    (step) => {
      const folders = Inventory.StudentFolders.all().filter(
        (folder) => folder.meta.active
      );
      lib.Progress.setMax(folders.length);
      return folders.slice(step);
    },
    (folder) => folder.resetName(),
    renameAllStudentFolders(),
    step
  );
};
