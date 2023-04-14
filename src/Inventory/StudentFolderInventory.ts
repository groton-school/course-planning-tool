import CoursePlan from "../CoursePlan";
import * as Role from '../Role';
import FolderInventory from "./FolderInventory";
import { Key as InventoryKey } from "./Inventory";

export default class StudentFolderInventory extends FolderInventory {
    public static COL_STUDENT_EMAIL = 4;
    public static COL_STUDENT_FIRST_NAME = 5;
    public static COL_STUDENT_LAST_NAME = 6;

    protected creator(hostId: InventoryKey): GoogleAppsScript.Drive.Folder {
        const folder = CoursePlan.getFormFolderForStudentFolderFor(
            Role.Student.getByHostId(hostId.toString())
        ).createFolder(this.formatter(hostId));
        this.add([hostId, folder.getId(), folder.getUrl()]);
        return folder;
    }
}
