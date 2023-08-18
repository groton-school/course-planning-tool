const fs = require('fs');
const webpack = require('webpack');

const coursePlanModule = fs
  .readFileSync('src/Inventory/CoursePlans/CoursePlan.ts')
  .toString();

const studentFolderModule = fs
  .readFileSync('src/Inventory/StudentFolders/StudentFolder.ts')
  .toString();

module.exports = require('@battis/gas-lighter/webpack.config')({
  root: __dirname,
  plugins: [
    new webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(
        JSON.parse(fs.readFileSync('package.json')).version
      ),
      CREATE_STEPS: JSON.stringify(coursePlanModule.match(/#create/).length),
      UPDATE_HISTORY_STEPS: JSON.stringify(
        coursePlanModule.match(/#update-history/).length
      ),
      UPDATE_COURSES_STEPS: JSON.stringify(
        coursePlanModule.match(/#update-courses/).length
      ),
      DELETE_STEPS: JSON.stringify(coursePlanModule.match(/#delete/).length),
      REASSIGN_STEPS: JSON.stringify(
        coursePlanModule.match(/#reassign/).length +
        studentFolderModule.match(/#reassign/).length
      ),
      INACTIVE_STEPS: JSON.stringify(
        coursePlanModule.match(/#inactive/).length +
        studentFolderModule.match(/#inactive/).length
      ),
      RESET_PERMISSIONS_STEPS: JSON.stringify(
        coursePlanModule.match(/#reset-permissions/).length
      )
    })
  ],
  production: false
});
