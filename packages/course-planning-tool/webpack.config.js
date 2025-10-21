const fs = require('fs');
const webpack = require('webpack');

const DEBUGGING = true;

const COURSE_PLAN = 'src/Inventory/CoursePlans/CoursePlan.ts';
const STUDENT_FOLDER = 'src/Inventory/StudentFolders/StudentFolder.ts';
const ADVISOR_FOLDER = 'src/Inventory/AdvisorFolders/AdvisorFolder.ts';
const DOCUMENTATION = 'src/Workflow/Documentation.ts';

const files = {};

function stepCount(filePaths, hash) {
  let count = 0;
  for (const filePath of filePaths) {
    if (!files[filePath]) {
      files[filePath] = fs.readFileSync(filePath).toString();
    }
    count += files[filePath].match(new RegExp(`//.*${hash}`, 'g'))?.length || 0;
  }
  console.log(`${hash}: ${count} steps`);
  return JSON.stringify(count);
}

module.exports = require('@battis/gas-lighter/webpack.config')({
  root: __dirname,
  plugins: [
    new webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(
        JSON.parse(fs.readFileSync('package.json')).version
      ),
      CREATE_STEPS: stepCount([COURSE_PLAN, STUDENT_FOLDER], '#create'),
      UPDATE_ENROLLMENT_HISTORY_STEPS: stepCount(
        [COURSE_PLAN],
        '#update-enrollment-history'
      ),
      UPDATE_COURSE_LIST_STEPS: stepCount([COURSE_PLAN], '#update-course-list'),
      DELETE_STUDENT_STEPS: stepCount(
        [COURSE_PLAN, STUDENT_FOLDER],
        '#delete-student'
      ),
      DELETE_ADVISOR_STEPS: stepCount([ADVISOR_FOLDER], '#delete-advisor'),
      ASSIGN_TO_CURRENT_ADVISOR_STEPS: stepCount(
        [COURSE_PLAN, STUDENT_FOLDER],
        '#assign-to-current-advisor'
      ),
      DEACTIVATE_STEPS: stepCount([COURSE_PLAN, STUDENT_FOLDER], '#deactivate'),
      RESET_COURSE_PLAN_PERMISSIONS_STEPS: stepCount(
        [COURSE_PLAN, STUDENT_FOLDER],
        '#reset-course-plan-permissions'
      ),
      RESET_STUDENT_FOLDER_PERMISSIONS_STEPS: stepCount(
        [STUDENT_FOLDER],
        '#reset-student-folder-permissions'
      ),
      RESET_ADVISOR_FOLDER_PERMISSIONS_STEPS: stepCount(
        [ADVISOR_FOLDER],
        '#reset-advisor-folder-permissions'
      ),
      DOCUMENTATION_COURSE_PLAN_DATA_STEPS: stepCount(
        [DOCUMENTATION],
        '#doc-course-plan-data'
      )
    })
  ],
  production: !DEBUGGING
});
