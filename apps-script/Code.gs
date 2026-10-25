// CHANGE_REQUEST_021 — the athlete's own Apps Script. It runs as the athlete
// and is the only thing that touches Drive: the app sends it the connection
// key and the state, never a Google pass. Permission is `drive.file` only
// (appsscript.json), so the script can read and write the files it created
// itself and nothing else. Drive calls go through the advanced Drive service
// (REST v3), not DriveApp, because DriveApp asks for the whole Drive.
//
// The pure part (`chooseWinner`, `handleRequest`) takes its services as an
// argument and is exported under the `module` guard at the bottom, so vitest
// can test it without Apps Script.

var STATE_FILE = 'coach-concours-state-v2.json';
var ROOT_FOLDER = 'Coach Concours app (script)';
var DATA_FOLDER = 'Données';
var BACKUPS_FOLDER = 'Sauvegardes';
var FOLDER_MIME = 'application/vnd.google-apps.folder';
var JSON_MIME = 'application/json';
var LOCK_WAIT_MS = 20000;
var PROPERTY = {
  key: 'connectionKey',
  rootFolderId: 'rootFolderId',
  dataFolderId: 'dataFolderId',
  backupsFolderId: 'backupsFolderId',
  stateFileId: 'stateFileId'
};

// CHANGE_REQUEST_005 rule, unchanged: the copy with the higher revision wins,
// a tie keeps the incoming copy (the phone's local one). Never a field-by-field
// merge.
function chooseWinner(stored, incoming) {
  if (stored && typeof stored.revision === 'number' && stored.revision > incoming.revision) return 'stored';
  return 'incoming';
}

function keyMatches(expected, given) {
  if (typeof expected !== 'string' || expected.length === 0) return false;
  if (typeof given !== 'string' || given.length !== expected.length) return false;
  var difference = 0;
  for (var index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ given.charCodeAt(index);
  }
  return difference === 0;
}

function isCoachState(value) {
  return !!value && typeof value === 'object' && value.schemaVersion === 2 && typeof value.revision === 'number';
}

function backupStamp(date) {
  return date.toISOString().replace(/[:.]/g, '-');
}

// `env` = { getKey(), withLock(fn), now(), store: { readState(), writeState(text),
// stateFileId(), writeBackup(name, text) } }. A wrong or missing key returns
// before anything in `store` is called.
function handleRequest(body, env) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'bad_request' };
  if (!keyMatches(env.getKey(), body.key)) return { ok: false, error: 'bad_key' };
  if (body.action === 'ping') return { ok: true };
  if (body.action !== 'sync' && body.action !== 'backup') return { ok: false, error: 'bad_request' };
  var incoming = body.state;
  if (!isCoachState(incoming)) return { ok: false, error: 'bad_state' };

  return env.withLock(function () {
    if (body.action === 'backup') {
      env.store.writeBackup('coach-concours-' + backupStamp(env.now()) + '.json', JSON.stringify(incoming, null, 2));
      return { ok: true };
    }
    var storedText = env.store.readState();
    var stored = null;
    if (storedText) {
      // A stored file that does not parse is never overwritten: the app keeps
      // its local copy and the file stays as it is for a human to look at.
      try { stored = JSON.parse(storedText); } catch (error) { return { ok: false, error: 'stored_unreadable' }; }
    }
    if (chooseWinner(stored, incoming) === 'stored') {
      return { ok: true, state: stored, fileId: env.store.stateFileId() };
    }
    var fileId = env.store.writeState(JSON.stringify(incoming, null, 2));
    return { ok: true, state: incoming, fileId: fileId };
  });
}

// ---------- Apps Script entry points ----------

function doPost(e) {
  var body = null;
  try { body = JSON.parse(e && e.postData ? e.postData.contents : ''); } catch (error) { body = null; }
  var result;
  // Nothing is logged here: neither the state nor the key.
  try { result = handleRequest(body, scriptEnv_()); } catch (error) { result = { ok: false, error: 'script_error' }; }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

// Run once from the editor after the first deployment. Running it again
// replaces the key, which is how the athlete changes the connection code.
function setup() {
  var key = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty(PROPERTY.key, key);
  var url = '';
  try { url = ScriptApp.getService().getUrl() || ''; } catch (error) { url = ''; }
  Logger.log(connectionLine(url, key));
}

// From the editor, the URL can come back as the test deployment (`/dev`),
// which an anonymous phone cannot call: the line then asks for the
// deployment's own URL instead of handing out a code that would not work.
function connectionLine(url, key) {
  if (/\/exec$/.test(url)) return url + '#' + key;
  return 'URL_WEB_APP#' + key + '   (remplace URL_WEB_APP par l\'URL de l\'application web, celle qui finit par /exec)';
}

function scriptEnv_() {
  var properties = PropertiesService.getScriptProperties();
  return {
    getKey: function () { return properties.getProperty(PROPERTY.key); },
    withLock: function (work) {
      var lock = LockService.getScriptLock();
      lock.waitLock(LOCK_WAIT_MS);
      try { return work(); } finally { lock.releaseLock(); }
    },
    now: function () { return new Date(); },
    store: driveStore_(properties)
  };
}

function driveStore_(properties) {
  function folderId(property, name, parentId) {
    var id = properties.getProperty(property);
    if (id) return id;
    var metadata = { name: name, mimeType: FOLDER_MIME };
    if (parentId) metadata.parents = [parentId];
    id = Drive.Files.create(metadata).id;
    properties.setProperty(property, id);
    return id;
  }
  function rootId() { return folderId(PROPERTY.rootFolderId, ROOT_FOLDER); }
  function dataId() { return folderId(PROPERTY.dataFolderId, DATA_FOLDER, rootId()); }
  function backupsId() { return folderId(PROPERTY.backupsFolderId, BACKUPS_FOLDER, rootId()); }
  function jsonBlob(text, name) { return Utilities.newBlob(text, JSON_MIME, name); }

  return {
    stateFileId: function () { return properties.getProperty(PROPERTY.stateFileId); },
    readState: function () {
      var id = properties.getProperty(PROPERTY.stateFileId);
      if (!id) return null;
      return textOf_(Drive.Files.get(id, { alt: 'media' }));
    },
    writeState: function (text) {
      var id = properties.getProperty(PROPERTY.stateFileId);
      if (id) {
        Drive.Files.update({}, id, jsonBlob(text, STATE_FILE));
        return id;
      }
      var parent = dataId();
      backupsId();
      id = Drive.Files.create({ name: STATE_FILE, mimeType: JSON_MIME, parents: [parent] }, jsonBlob(text, STATE_FILE)).id;
      properties.setProperty(PROPERTY.stateFileId, id);
      return id;
    },
    writeBackup: function (name, text) {
      Drive.Files.create({ name: name, mimeType: JSON_MIME, parents: [backupsId()] }, jsonBlob(text, name));
    }
  };
}

// `Drive.Files.get(id, { alt: 'media' })` hands back the file body; depending
// on the service version it is a string, a byte array or a blob.
function textOf_(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value.getDataAsString === 'function') return value.getDataAsString();
  if (value && typeof value.length === 'number') return Utilities.newBlob(value).getDataAsString();
  return null;
}

if (typeof module !== 'undefined') {
  module.exports = { chooseWinner: chooseWinner, handleRequest: handleRequest, connectionLine: connectionLine, keyMatches: keyMatches };
}
