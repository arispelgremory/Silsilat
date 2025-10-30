#!/usr/bin/env node

const fs = require('fs');
const execSync = require('child_process').execSync;

// Function to reset version in package.json
function resetPackageVersion() {
  const packageJsonPath = 'package.json';
  const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Reset the version number
  packageData.version = '0.1.0';

  // Write the updated package.json back to the file system
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageData, null, 2));

  console.log('package.json version reset to 0.1.0');
}

// Function to clear CHANGELOG.md
function clearChangelog() {
  const changelogPath = 'CHANGELOG.md';

  // Write a default header to CHANGELOG.md
  const header = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n';
  fs.writeFileSync(changelogPath, header);

  console.log('CHANGELOG.md has been cleared.');
}

// Function to delete existing git tags
function deleteGitTags() {
  try {
    const tags = execSync('git tag').toString().trim().split('\n');
    if (tags.length && tags[0] !== '') {
      execSync('git tag -d $(git tag)');
      console.log('All git tags have been deleted.');
    } else {
      console.log('No git tags to delete.');
    }
  } catch (error) {
    console.error('An error occurred while deleting git tags:', error.message);
  }
}

// Run the initialization functions
resetPackageVersion();
clearChangelog();
deleteGitTags();

console.log('Project initialization complete.');
