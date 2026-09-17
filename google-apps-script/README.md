# Google Form profile-sync setup

The student-profile workflow has three layers:

1. Students submit the Google Form, including optional portrait files.
2. The linked response spreadsheet exposes only rows Jared marks **Approved** through the Apps Script in `ProfileFeed.gs`.
3. GitHub checks that approved feed daily, validates every field, strips portrait metadata, crops portraits to 800 × 1000 pixels, commits only real changes, and republishes the Pages site.

Unreviewed responses, email addresses, reviewer notes, and private Drive file IDs never enter the repository or public feed.

## Required form question titles

The response sheet headers must match these titles exactly:

- `Preferred display name`
- `Which profile is this request for?`
- `Request`
- `Degree level`
- `Years with the group`
- `Brief bio`
- `Research areas`
- `Personal or research website`
- `Other professional profile`
- `Portrait`
- `Remove my current portrait`
- `Publication permission`

The form options must also match the constants near the top of `ProfileFeed.gs`. Students should submit a new response for every later correction; response editing should remain disabled.

## Install the review feed

1. Link the form to a new Google response spreadsheet.
2. Open Apps Script and create a project owned by the form owner.
3. Replace the starter code with `ProfileFeed.gs`, add `Authorization.gs`, and copy `appsscript.json` into the project manifest. If the form is replaced, update its ID at the top of `ProfileFeed.gs`; the linked response spreadsheet is discovered automatically.
4. Save and run `setupProfileSystem` once, then run `authorizeProfilePortraits` once. Accept the requested Forms, Sheets, read-only Drive, and trigger permissions. The setup fixes the form branching, adds `Website approval` and `Website review notes` columns plus an approval dropdown, assigns hidden permanent submission IDs, installs the response trigger, and authorizes access to approved portrait uploads.
5. Choose **Deploy → New deployment → Web app**. Execute as yourself and permit access to anyone with the link. Copy the `/exec` URL.
6. Open the `/exec` URL in a signed-out browser. A working empty feed looks like `{"schemaVersion":1,"generatedAt":"…","submissions":[]}`.
7. In GitHub, open **Settings → Secrets and variables → Actions → Variables** and create `PROFILE_FEED_URL` with that `/exec` URL.
8. Run the **Refresh approved student profiles** workflow once from the Actions tab.

If the BYU Google Workspace administrator does not permit an “anyone” web-app deployment, keep the form and review sheet but use the local `npm run people:update` command with an authorized feed URL, or request an approved service-account arrangement from BYU IT. Do not make the response spreadsheet itself public.

## Routine use

- Review a complete submission and choose `Approved` in its `Website approval` cell.
- The website checks daily; the GitHub workflow also has a manual **Run workflow** button.
- Never edit or unapprove a response after it has synced. Approve a newer correction or removal request instead. The importer deliberately stops if a previously published approval disappears or changes.
