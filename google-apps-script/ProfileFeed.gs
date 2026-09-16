/**
 * Moderated student-profile feed for the Data-Driven Modeling Group website.
 *
 * Install this file in an Apps Script project owned by the form owner. Run
 * setupProfileSystem() once, then deploy this project as a web app that
 * executes as the owner.
 */

const PROFILE_SCHEMA_VERSION = 1;
const PROFILE_FORM_ID = "1T7-wBpVb34ob0p_-itHQzFoaATy1Ah6WlMhqPPWxHeg";
const REVIEW_STATUS_HEADER = "Website approval";
const REVIEW_NOTES_HEADER = "Website review notes";
const SUBMISSION_ID_HEADER = "Website submission ID";
const APPROVED_STATUS = "Approved";
const QUESTION = Object.freeze({
  timestamp: "Timestamp",
  name: "Preferred display name",
  target: "Which profile is this request for?",
  request: "Request",
  degree: "Degree level",
  years: "Years with the group",
  bio: "Brief bio",
  research: "Research areas",
  website: "Personal or research website",
  professionalLink: "Other professional profile",
  portrait: "Portrait",
  removePortrait: "Remove my current portrait",
  permission: "Publication permission",
});
const REQUEST = Object.freeze({
  upsert: "Add or update my profile",
  remove: "Remove my profile",
});
const NEW_PROFILE = "New profile";
const PERMISSION_TEXT = "I approve publication of the submitted text, links, and photograph on the Data-Driven Modeling Group website.";
const REMOVE_PORTRAIT_TEXT = "Remove my current portrait";

function setupProfileSystem() {
  configureProfileFormRouting_();
  setupProfileReviewSheet();
}

function configureProfileFormRouting_() {
  const form = FormApp.openById(PROFILE_FORM_ID);
  const requestItem = form.getItems(FormApp.ItemType.MULTIPLE_CHOICE)
    .map((item) => item.asMultipleChoiceItem())
    .find((item) => item.getTitle() === QUESTION.request);
  const pages = form.getItems(FormApp.ItemType.PAGE_BREAK)
    .map((item) => item.asPageBreakItem());
  const detailsPage = pages.find((item) => item.getTitle() === "Profile details");
  const removalPage = pages.find((item) => item.getTitle() === "Removal confirmation");

  if (!requestItem || !detailsPage || !removalPage) {
    throw new Error("The form's Request, Profile details, or Removal confirmation item was not found.");
  }

  requestItem.setChoices([
    requestItem.createChoice(REQUEST.upsert, detailsPage),
    requestItem.createChoice(REQUEST.remove, removalPage),
  ]);
  // A PageBreakItem controls what happens after the page immediately before it.
  removalPage.setGoToPage(FormApp.PageNavigationType.SUBMIT);
}

function setupProfileReviewSheet() {
  const spreadsheetId = linkedResponseSpreadsheetId_();
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = findResponseSheet_(spreadsheet);
  PropertiesService.getScriptProperties().setProperty("PROFILE_SPREADSHEET_ID", spreadsheetId);

  const statusColumn = ensureColumn_(sheet, REVIEW_STATUS_HEADER);
  ensureColumn_(sheet, REVIEW_NOTES_HEADER);
  const submissionIdColumn = ensureColumn_(sheet, SUBMISSION_ID_HEADER);
  const rows = Math.max(sheet.getMaxRows() - 1, 1);
  const statusRange = sheet.getRange(2, statusColumn, rows, 1);
  const validation = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Not reviewed", APPROVED_STATUS, "Needs changes"], true)
    .setAllowInvalid(false)
    .setHelpText("Approve only complete submissions. Once published, submit a new correction instead of editing this row.")
    .build();
  statusRange.setDataValidation(validation);
  sheet.getRange(1, statusColumn).setNote(
    "Only rows marked Approved enter the website feed. After a row has synced, do not edit or unapprove it; approve a newer correction instead.",
  );
  sheet.getRange(1, submissionIdColumn).setNote(
    "Permanent website-sync identifier. Do not edit this column.",
  );
  assignMissingSubmissionIds_(sheet, submissionIdColumn);
  sheet.hideColumns(submissionIdColumn);
  sheet.setFrozenRows(1);

  const rules = sheet.getConditionalFormatRules().filter((rule) => {
    const ranges = rule.getRanges();
    return !ranges.some((range) => range.getColumn() === statusColumn);
  });
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(APPROVED_STATUS)
      .setBackground("#d9ead3")
      .setRanges([statusRange])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Needs changes")
      .setBackground("#f4cccc")
      .setRanges([statusRange])
      .build(),
  );
  sheet.setConditionalFormatRules(rules);

  const existingTrigger = ScriptApp.getProjectTriggers().some((trigger) =>
    trigger.getHandlerFunction() === "markNewProfileSubmission_",
  );
  if (!existingTrigger) {
    ScriptApp.newTrigger("markNewProfileSubmission_")
      .forSpreadsheet(spreadsheet)
      .onFormSubmit()
      .create();
  }
}

function markNewProfileSubmission_(event) {
  if (!event || !event.range) return;
  const sheet = event.range.getSheet();
  const headers = headerMap_(sheet);
  const statusColumn = headers[REVIEW_STATUS_HEADER];
  const submissionIdColumn = headers[SUBMISSION_ID_HEADER];
  if (statusColumn) sheet.getRange(event.range.getRow(), statusColumn).setValue("Not reviewed");
  if (submissionIdColumn) {
    sheet.getRange(event.range.getRow(), submissionIdColumn).setValue(newSubmissionId_());
  }
}

function doGet(event) {
  try {
    const photoToken = String(event && event.parameter && event.parameter.photo || "").trim();
    return jsonOutput_(photoToken ? approvedPhoto_(photoToken) : approvedFeed_());
  } catch (error) {
    return jsonOutput_({
      schemaVersion: PROFILE_SCHEMA_VERSION,
      error: error && error.message ? error.message : String(error),
    });
  }
}

function approvedFeed_() {
  const submissions = approvedSubmissions_().map((submission) => {
    const publicSubmission = Object.assign({}, submission);
    delete publicSubmission.photoFileId;
    return publicSubmission;
  });
  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    submissions: submissions,
  };
}

function approvedPhoto_(photoToken) {
  const submission = approvedSubmissions_().find((item) => item.photoToken === photoToken);
  if (!submission || !submission.photoFileId) throw new Error("The requested approved portrait was not found.");

  const file = DriveApp.getFileById(submission.photoFileId);
  const blob = file.getBlob();
  const mimeType = String(blob.getContentType() || "");
  if (mimeType.indexOf("image/") !== 0) throw new Error("The approved portrait is not an image.");
  const bytes = blob.getBytes();
  if (!bytes.length || bytes.length > 20 * 1024 * 1024) throw new Error("The approved portrait is empty or larger than 20 MB.");

  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    photoToken: photoToken,
    mimeType: mimeType,
    base64: Utilities.base64Encode(bytes),
  };
}

function approvedSubmissions_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("PROFILE_SPREADSHEET_ID") || linkedResponseSpreadsheetId_();
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = findResponseSheet_(spreadsheet);
  const range = sheet.getDataRange();
  const values = range.getValues();
  const displayValues = range.getDisplayValues();
  const richTextValues = range.getRichTextValues();
  if (values.length < 2) return [];

  const headers = displayValues[0].map((value) => String(value).trim());
  const columns = {};
  headers.forEach((header, index) => { columns[header] = index; });
  requiredHeaders_().forEach((header) => {
    if (columns[header] === undefined) throw new Error("Missing response column: " + header);
  });

  const submissions = [];
  for (let rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
    const row = values[rowIndex];
    const displayRow = displayValues[rowIndex];
    if (cell_(displayRow, columns, REVIEW_STATUS_HEADER) !== APPROVED_STATUS) continue;

    submissions.push(buildSubmission_(
      rowIndex + 1,
      row,
      displayRow,
      richTextValues[rowIndex],
      columns,
    ));
  }
  return submissions.sort((left, right) =>
    left.submittedAt.localeCompare(right.submittedAt) || left.id.localeCompare(right.id),
  );
}

function buildSubmission_(rowNumber, row, displayRow, richTextRow, columns) {
  const timestampValue = row[columns[QUESTION.timestamp]];
  const timestamp = timestampValue instanceof Date ? timestampValue : new Date(timestampValue);
  if (Number.isNaN(timestamp.getTime())) throw new Error("Approved row " + rowNumber + " has an invalid timestamp.");
  const submittedAt = timestamp.toISOString();
  const id = cell_(displayRow, columns, SUBMISSION_ID_HEADER);
  if (!/^response-[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error("Approved row " + rowNumber + " is missing its permanent website submission ID. Run setupProfileSystem() again.");
  }
  const request = cell_(displayRow, columns, QUESTION.request);
  const target = cell_(displayRow, columns, QUESTION.target);
  const name = cell_(displayRow, columns, QUESTION.name);
  const profileId = slugify_(target === NEW_PROFILE ? name : target);

  if (!profileId) throw new Error("Approved row " + rowNumber + " does not identify a profile.");
  if (request === REQUEST.remove) {
    return {
      id: id,
      submittedAt: submittedAt,
      action: "remove",
      profileId: profileId,
    };
  }
  if (request !== REQUEST.upsert) throw new Error("Approved row " + rowNumber + " has an unknown request type.");

  const permission = cell_(displayRow, columns, QUESTION.permission);
  if (permission.indexOf(PERMISSION_TEXT) === -1) {
    throw new Error("Approved row " + rowNumber + " does not include publication permission.");
  }
  const degreeLevel = cell_(displayRow, columns, QUESTION.degree);
  const bio = cell_(displayRow, columns, QUESTION.bio);
  if (!name || !degreeLevel || !bio) throw new Error("Approved row " + rowNumber + " is missing required profile details.");

  const portraitIndex = columns[QUESTION.portrait];
  const photoFileId = driveFileId_(richTextRow[portraitIndex], displayRow[portraitIndex]);
  const removePhoto = cell_(displayRow, columns, QUESTION.removePortrait).indexOf(REMOVE_PORTRAIT_TEXT) !== -1;
  if (photoFileId && removePhoto) throw new Error("Approved row " + rowNumber + " both uploads and removes a portrait.");

  const submission = {
    id: id,
    submittedAt: submittedAt,
    action: "upsert",
    profileId: profileId,
    name: name,
    degreeLevel: degreeLevel,
    years: cell_(displayRow, columns, QUESTION.years),
    bio: bio,
    researchAreas: splitCheckboxes_(cell_(displayRow, columns, QUESTION.research)),
    website: cell_(displayRow, columns, QUESTION.website),
    professionalLink: cell_(displayRow, columns, QUESTION.professionalLink),
    removePhoto: removePhoto,
  };
  if (photoFileId) {
    submission.photoToken = id;
    submission.photoFileId = photoFileId;
  }
  return submission;
}

function requiredHeaders_() {
  return Object.keys(QUESTION).map((key) => QUESTION[key]).concat([
    REVIEW_STATUS_HEADER,
    SUBMISSION_ID_HEADER,
  ]);
}

function findResponseSheet_(spreadsheet) {
  const sheet = spreadsheet.getSheets().find((candidate) => {
    const lastColumn = candidate.getLastColumn();
    if (!lastColumn) return false;
    const headers = candidate.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
    return headers.indexOf(QUESTION.timestamp) !== -1 && headers.indexOf(QUESTION.request) !== -1;
  });
  if (!sheet) throw new Error("No linked form-response sheet with the expected question headers was found.");
  return sheet;
}

function linkedResponseSpreadsheetId_() {
  const form = FormApp.openById(PROFILE_FORM_ID);
  const spreadsheetId = form.getDestinationId();
  if (!spreadsheetId) {
    throw new Error("The profile form is not linked to a response spreadsheet.");
  }
  return spreadsheetId;
}

function headerMap_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const map = {};
  headers.forEach((header, index) => { map[String(header).trim()] = index + 1; });
  return map;
}

function ensureColumn_(sheet, header) {
  const headers = headerMap_(sheet);
  if (headers[header]) return headers[header];
  const column = sheet.getLastColumn() + 1;
  sheet.getRange(1, column).setValue(header);
  return column;
}

function assignMissingSubmissionIds_(sheet, submissionIdColumn) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const timestampColumn = headerMap_(sheet)[QUESTION.timestamp];
  if (!timestampColumn) return;

  const timestamps = sheet.getRange(2, timestampColumn, lastRow - 1, 1).getValues();
  const idRange = sheet.getRange(2, submissionIdColumn, lastRow - 1, 1);
  const ids = idRange.getValues();
  let changed = false;
  for (let index = 0; index < ids.length; index += 1) {
    if (timestamps[index][0] && !ids[index][0]) {
      ids[index][0] = newSubmissionId_();
      changed = true;
    }
  }
  if (changed) idRange.setValues(ids);
}

function newSubmissionId_() {
  return "response-" + Utilities.getUuid();
}

function cell_(row, columns, header) {
  const index = columns[header];
  return index === undefined ? "" : String(row[index] || "").trim();
}

function splitCheckboxes_(value) {
  if (!value) return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function slugify_(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function driveFileId_(richText, displayValue) {
  const urls = [];
  if (richText) {
    const direct = richText.getLinkUrl();
    if (direct) urls.push(direct);
    richText.getRuns().forEach((run) => {
      const url = run.getLinkUrl();
      if (url) urls.push(url);
    });
  }
  urls.push(String(displayValue || ""));

  for (let index = 0; index < urls.length; index += 1) {
    const url = urls[index];
    const pathMatch = url.match(/\/d\/([A-Za-z0-9_-]+)/);
    if (pathMatch) return pathMatch[1];
    const queryMatch = url.match(/[?&]id=([A-Za-z0-9_-]+)/);
    if (queryMatch) return queryMatch[1];
  }
  return "";
}

function jsonOutput_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
