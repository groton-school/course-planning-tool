const fs = require('fs');
const webpack = require('webpack');

const coursePlanModule = fs
  .readFileSync('src/Inventory/CoursePlans/CoursePlan.ts')
  .toString();

function stepCount(hash) {
  const count = JSON.stringify(
    coursePlanModule.match(new RegExp(`#${hash}`, 'g')).length
  );
  console.log(`#${hash}: ${count} steps`);
  return count;
}

module.exports = require('@battis/gas-lighter/webpack.config')({
  root: __dirname,
  plugins: [
    new webpack.DefinePlugin({
      APP_VERSION: JSON.stringify(
        JSON.parse(fs.readFileSync('package.json')).version
      ),
      CREATE_STEPS: stepCount('create'),
      UPDATE_HISTORY_STEPS: stepCount('update-history'),
      UPDATE_COURSES_STEPS: stepCount('update-courses'),
      DELETE_STEPS: stepCount('delete'),
      REASSIGN_STEPS: stepCount('reassign'),
      INACTIVE_STEPS: stepCount('inactive'),
      RESET_PERMISSIONS_STEPS: stepCount('reset-permissions')
    })
  ],
  production: true
});
