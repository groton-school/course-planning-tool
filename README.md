# Course Planning Tool

## How to Use

### Annual Updates

Queries or functions that need to be updated annually are listed here:

1. [Historical Enrollment](#refresh-historical-enrollment) needs to be updated, as noted.
2. Advisor List, Course List, and Historical Enrollment sheets in Course Planning Data all need to be updated to current values (recommend using [Blackbaud Lists](https://github.com/groton-school/blackbaud-to-google-lists) add-on)
3. Available Courses needs to be reviewed for accuracy.
4. Review `cp-cco`, `cp-ao`, `cp-sc` group memberships for accuracy.

### Workflows

All workflows are available from the `Course Planning` menu in the [Course Planning Data sheet](./schema/sheets/Course%20Planning%20Data.xlsx).

![Screenshot](./images/screenshot.png)

<table><thead><th>
  
#### Management

</th></thead><tbody><tr><td>
        
##### Create all course plans

Creates a new course plan for all students in the Advisor List sheet who do not already have a course plan registered in the Course Plan Inventory sheet, updating permissions and the Course Plan Inventory.

##### Create course plans by form…

Presents a dialog to choose a form by class year. Upon selection, it will create a new course plan for each student in the form in the Advisor List sheet who do not already have a course plan registered in the Course Plan Inventory sheet, updating permissions and the Course Plan Inventory.

##### Update all course plan enrollment histories

Updates all course plans in the Course Plan Inventory to reflect updated enrollment history. See note on [Update a single course plan's enrollment history](#update-a-single-course-plans-enrollment-history) below. Note that this likely requires [refreshing Historical Enrollments first](#refresh-historical-enrollments).

##### Update all course plan course lists

Updates the Courses by Department sheet of all course plans in the Course Plan Inventory to match the Courses by Department sheet of the Course Planning Data sheet. Note that this likely requires [refreshing Historical Enrollments first](#refresh-historical-enrollments).

</td></tr></tbody></table>
<table><thead><th>
  
#### Troubleshooting

</th></thead><tbody><tr><td>

##### Create a single course plan…

Presents a dialog to choose a student from the list of students in the Advisor List sheet. Upon selection, it will create a new course plan for that student if there is not one already registered in the Course Plan Inventory sheet, updating permissions and the Course Plan Inventory. At the end, you will be presented with a direct link to the student course plan (either pre-existing or newly created).

##### Update a single course plan's enrollment history…

Updates a specific course plan to reflect updated enrollment history. This does not expand the enrollment history beyond the original scope (i.e., if created in the spring of 2023, and then updated in spring of 2024, it will _not_ add 2024 courses in and will _not_ overwrite plans/comments).

##### Update a single course plan's course list…

Updates a specific course plan's Courses by Department sheet to match the Course Planning Data Courses by Department sheet.

##### Delete a single course plan…

Select a the student whose course plan to delete. This will leave all containers (student folder, advisor folder, form folders) and shortcuts, deleting only the course plan.

</td></tr></tbody></table>
<table><thead><th colspan="2">
  
#### Restructuring

</th></thead><tbody><tr><th>
  
##### v0.2.0
  
</th><td>

##### Create a single missing student folder…

Select the student who already has a course plan for whom to check for a missing student folder, and create it (if missing), updating inventories and reorganizing the existing course plan and shortcuts.

##### Create all missing student folders

Check all students who have course plans for a missing student folder, and create it (if missing), updating inventories and reorganizing the existing course plan and shortcuts.

</td></tr></tbody></table>
<table><thead><th>

#### Documentation

</th></thead><tbody><tr><td>

##### Download a clean copy of Course Planning Data

Downloads an XLSX file that contains all of the formatting and functions, but none of the data in the Course Planning Data sheet. (Useful for documentation.)

##### Download a clean copy of Course Plan Template

Downloads an XLSX file that contains all of the formatting and unctions, but none of the data in the Course Plan Template sheet. (Useful for documenation.)

</td></tr></tbody></table>
<table><thead><th>
  
#### Manual Updates

</th></thead><tbody><tr><td>

##### Refresh Historical Enrollment

1. Go to the Historical Enrollment list in Academics > Grades > Report card grades list
2. Adjust the filters and export CSV files of the list for…

- Current year, forms 2, 3, 4, 5
- 1 year ago, forms 2, 3, 4
- 2 years ago, forms 2, 3
- 3 years ago, form 2

3. Open the current year CSV in Google Sheets (largest file -- too large to copy and paste)
4. Paste the data from the other three exports into that same sheet
5. Create a sheet that gets just the `UNIQUE()` records from that combined CSV export
6. Replace the unique records with a copy-and-paste-by-value to reduce dependency overhead
7. `IMPORTRANGE()` that list into the Historical Enrollment worksheet in Course Planning Data
8. Replace the imported range with a copy-and-paste-by-value to reduce dependency overhead

##### Creating new student course plans midsummer

…before advisor data is entered in myGroton.

1. In the Advisor List sheet, add the student information as known in all pink fields. (An arbitrary advisor will need to be chosen.)
2. Use the `Create a single course plan` workflow to generate that student's course plan, folder, etc.

When the student's advisor is finalized, they will have to go through the `A student changes adivsor` workflow below.

##### A student changes advisor

If they change advisors at the "normal" time of year (right as the Roll-Over Academic Year workflow is started), nothing needs to happen.

If they change advisors at another time of year:

1. Copy their current row from the `Advisors List` sheet to replace their row (if present -- add a row if not) in `Advisors List (Previous Year`.
2. Run an update on their course plan (e.g. Update Course Listing) to automatically reset permissions, aliases, etc. for their course plan.

</td></tr></tbody></table>

## Technical Overview

- The course planning tool resides in the `Course Planning` shared drive.
- The data that drives it is stored in the [Course Planning Data sheet](./schema/sheets/Course%20Planning%20Data.xlsx).
- The data in the sheet is pulled from Blackbaud advanced lists categorized as “Course Planning”.
- The code runs it is an Apps Script extension attached to the sheet, with [the source code managed on GitHub](https://github.com/groton-school/course-planning-tool).
- Any outstanding issues with the code are also [tracked on GitHub](https://github.com/groton-school/course-planning-tool/issues).
- Developing the code requires [node](https://nodejs.org/) to install and manage dependencies and to compile and deploy the project.

### Permissions

- The project is owned by the `tech` account
- The groups `all-technology`, `cp-cco`, `cp-ao`, and `cp-sc` have general access to the files.
  - `cp-cco` represents the College Counseling Office
  - `cp-ao` represents the Academics Office
  - `cp-sc` represents the Studies Committee
- `cp-ao`, `cp-sc`, and `cp-cco` have read access to the entire shared drive.
- Only `tech` and `all-technology` have Content Manager access to the shared drive, which means that all other users have to ask permission before re-sharing files on the drive.
- `cp-ao` has limited edit access to the [Course Planning Data sheet](./schema/sheets/Course%20Planning%20Data.xlsx), specifically the checkboxes in the Available Courses worksheet to adjust what courses appear in the course plan drop-down menus.
- `cp-cco` has read/write access to the `Course Plans by Forms` folder
- `cp-cco` has read/write/delete access to the `Student Folders by Form` folder.
- Within each course plan, areas of the main Course Plan sheet are protected such that:
  - Only advisors and the college counseling office can add comments in their respective comment sections
  - All labels and headings are not editable by any users
  - The Courses by Department sheet is not editable
- As they are created course plans are shared (without notification) with the student and advisor
- The advanced lists that pull the data from Blackbaud are available to all Platform Managers

### File Management

- All course plans are copies of the [Course Plan Template](./schema/sheets/Course%20Plan%20Template.xlsx) spreadsheet.
- The original course plans are stored by form in the `Course Plans by Form` folder.
- Shortcuts to the course plans are stored in student folders by form in the `Student Folders by Form` folder
- Shortcuts to the student folders are stored by advisory group in the `Student Folders by Advisor`, with each advisory group folder shared with the advisor (without notification).
- Links to each course plan, student folder, course plans form folder, student folder form folder, and advisory group folder are maintained in their respective inventory sheets in [Course Planning Data](./schema/sheets/Course%20Planning%20Data.xlsx)

### Data Sources

- Data in [Course Planning Data](./schema/sheets/Course%20Planning%20Data.xlsx) is pulled from [advanced list queries](./schema/queries) in Blackbaud
- Historical Enrollment, Advisor List, and Course List sheets each align with an advanced list in the Course Planning category, and can be synced using Seth’s experimental [Blackbaud Lists](https://github.com/groton-school/blackbaud-to-google-lists) Google Workspace Add-on. (Or manually with a lot of copying and pasting.)
- Other sheets in [Course Planning Data](./schema/sheets/Course%20Planning%20Data.xlsx) are generated from either these data sources or as a result of scripted workflows in the app.

## Setup

To rebuild this project from scratch…

- Create Google Groups to represent CCO and SC (ideally not receiving email, etc. Nothing matters other than membership from the perspective of this script.)
- Create a shared drive to hold the project (CCO and SC have Viewer access)
- Create a spreadsheet (doesn’t have to be on the shared drive) from [Course Planning Data schema](./schema/sheets/Course%20Planning%20Data.xlsx) (includes named ranges, sheets, functions, etc.)
- Populate the Historical Enrollment, Advisor List, and Course Lists sheets of the Course Planning Data sheet from Blackbaud queries of the same name (easiest is to use [Blackbaud to Google Lists](https://github.com/groton-school/blackbaud-to-google-lists), which requires a little setup of its own – at Groton it’s already deployed to the workspace)
- Create a Spreadsheet from the [Course Plan Template schema](./schema/sheets/Course%20Plan%20Template.xlsx) (includes named ranges, again, doesn’t necessarily have to be on the shared drive)
- Update the Parameters sheet of the Course Planning data spreadsheet with…
  - CCO and SC group emails
  - URL of the Course Plan Template
- Create a folder on the shared drive to hold all course plan form folders, giving CCO and AO Contributor access, and update the ID and URL columns of the Plan Form Folders Inventory sheet row for Form ROOT with that folder’s ID and URL.
- Create a folder on the shared drive to hold all advisory group folders, and update the ID and URL columns of the Advisor Folder Inventory sheet row for Advisor Email ROOT with that folder’s ID and URL.
- Create a folder on the shared drive to hold all student folder form folders, giving CCO Content Manager access, and update the ID and URL columns of the Folder Form Folders Inventory sheet row for Form ROOT with that folder's ID and URl/
- In the Course Planning Data spreadsheet, go to Extensions > Apps Script to open the embedded script for that sheet
  - Copy the ID of the script
  - [Enable Drive Service](https://developers.google.com/apps-script/guides/services/advanced#enable_advanced_services) for the script
- In your development workspace…

  ```bash
  git clone https://github.com/groton-school/course-planning-tool.git <project directory>
  cd <project directory>
  npm install
  node bin/setup.mjs
  npm run deploy
  ```

- Force-refresh the Course Planning Data spreadsheet to reload the newly-deployed script, and you’re all set.
