/**
 * Run once after changing OAuth scopes so the Apps Script owner grants
 * read-only access to approved portrait files stored in Google Drive.
 */
function authorizeProfilePortraits() {
  DriveApp.getRootFolder().getName();
}
