'use strict';
/*
 * Local career persistence. The original browser key and game save schema
 * are deliberately unchanged; this module only adds recovery safeguards.
 */
(() => {
  const KEY = 'the-motor-trade-career-v1';
  const BACKUP_KEY = 'the-motor-trade-career-backup-v1';
  const EXPORT_TYPE = 'the-motor-trade-career-export';
  const EXPORT_FORMAT = 1;
  const MAX_IMPORT_BYTES = 12 * 1024 * 1024;
  let lastSeenRaw = null;
  let activeKey = KEY;
  let activeBackupKey = BACKUP_KEY;
  function setNamespace(userId) {
    if (userId !== null && !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(userId))
      throw new Error('Invalid account identifier.');
    activeKey = userId === null ? KEY : 'the-motor-trade-account-' + userId.toLowerCase() + '-v1';
    activeBackupKey = userId === null ? BACKUP_KEY : 'the-motor-trade-account-backup-' + userId.toLowerCase() + '-v1';
    lastSeenRaw = null;
  }

  function store() {
    try { return window.localStorage; }
    catch (_) { return null; }
  }

  function decode(raw, normalize) {
    if (typeof raw !== 'string' || !raw) return null;
    try {
      const parsed = JSON.parse(raw);
      let state = parsed;
      if (parsed && typeof parsed === 'object' &&
        Object.prototype.hasOwnProperty.call(parsed, 'type')) {
        if (parsed.type !== EXPORT_TYPE || parsed.format !== EXPORT_FORMAT ||
          !Object.prototype.hasOwnProperty.call(parsed, 'career')) return null;
        state = parsed.career;
      }
      return normalize(state) || null;
    } catch (_) { return null; }
  }

  function status(normalize) {
    const storage = store();
    if (!storage) return {available:false, hasPrimary:false,
      primaryDamaged:false, backupAvailable:false};
    try {
      const raw = storage.getItem(activeKey);
      const backup = storage.getItem(activeBackupKey);
      return {available:true, hasPrimary:raw !== null,
        primaryDamaged:raw !== null && !decode(raw, normalize),
        backupAvailable:!!decode(backup, normalize)};
    } catch (_) {
      return {available:false, hasPrimary:false,
        primaryDamaged:false, backupAvailable:false};
    }
  }

  function load(normalize) {
    const storage = store();
    if (!storage) return {career:null, available:false,
      primaryDamaged:false, backupAvailable:false};
    try {
      const raw = storage.getItem(activeKey);
      lastSeenRaw = raw;
      const career = decode(raw, normalize);
      const backupAvailable = !!decode(storage.getItem(activeBackupKey), normalize);
      return {career, available:true, primaryDamaged:raw !== null && !career,
        backupAvailable, backupOnly:raw === null && backupAvailable};
    } catch (_) {
      return {career:null, available:false,
        primaryDamaged:false, backupAvailable:false};
    }
  }

  function save(career, normalize, options = {}) {
    const storage = store();
    if (!storage) return {ok:false,
      message:'Browser storage is blocked. Export your career to a file before leaving.'};
    let raw;
    try {
      raw = JSON.stringify(career);
      if (!decode(raw, normalize)) return {ok:false,
        message:'Career integrity check failed. Nothing was written. Export your career before leaving.'};
      const previous = storage.getItem(activeKey);
      if (!options.force && previous !== lastSeenRaw && previous !== raw)
        return {ok:false, message:'This career was changed in another tab. No save was overwritten. Export this tab, then reload to choose which career to keep.'};
      // Writing the valid new state FIRST makes a quota/write error harmless:
      // the old primary remains intact. A failed backup never blocks saving.
      if (previous !== raw) storage.setItem(activeKey, raw);
      lastSeenRaw = raw;
      const previousCareer = previous !== raw ? decode(previous, normalize) : null;
      const existingBackup = previousCareer ? decode(storage.getItem(activeBackupKey), normalize) : null;
      // Retain a meaningful restore point: do not replace the previous game
      // day's backup on every same-day inbox read, approval or render.
      // Explicit replacement/import/restore may always back up the old career.
      if (previousCareer && (options.backupPrevious ||
        !existingBackup || previousCareer.day !== career.day)) {
        try { storage.setItem(activeBackupKey, previous); }
        catch (_) { /* Keep the successfully written primary. */ }
      }
      return {ok:true};
    } catch (_) {
      return {ok:false,
        message:'The browser could not save this career (storage unavailable or full). Export a file before leaving.'};
    }
  }

  function recover(normalize) {
    const storage = store();
    if (!storage) return {ok:false, message:'Browser storage is unavailable.'};
    try {
      const career = decode(storage.getItem(activeBackupKey), normalize);
      if (!career) return {ok:false, message:'No valid local backup is available.'};
      const result = save(career, normalize, {force:true, backupPrevious:true});
      return {...result, career:result.ok ? career : null};
    } catch (_) {
      return {ok:false, message:'Unable to read or restore the backup.'};
    }
  }

  function exportText(career, normalize) {
    if (!career || !decode(JSON.stringify(career), normalize))
      throw new Error('This career did not pass the integrity check and cannot be exported as a valid save.');
    return JSON.stringify({
      type:EXPORT_TYPE, format:EXPORT_FORMAT,
      exportedAt:new Date().toISOString(), career
    }, null, 2);
  }

  function importText(text, normalize) {
    if (typeof text !== 'string' || text.length > MAX_IMPORT_BYTES)
      return {ok:false, message:'The selected file is too large or unreadable.'};
    try {
      const file = JSON.parse(text);
      if (!file || typeof file !== 'object' ||
        file.type !== EXPORT_TYPE || file.format !== EXPORT_FORMAT ||
        !Object.prototype.hasOwnProperty.call(file, 'career'))
        return {ok:false, message:'Not a supported The Motor Trade career backup file.'};
      const career = normalize(file.career);
      if (!career) return {ok:false,
        message:'The backup is damaged, incompatible, or fails the cash/stock integrity checks.'};
      return {ok:true, career};
    } catch (_) {
      return {ok:false, message:'Invalid JSON backup. Your current career has not been changed.'};
    }
  }

  window.MotorTradeCareerStorage = Object.freeze({
    KEY, BACKUP_KEY, MAX_IMPORT_BYTES, load, status, save, recover,
    exportText, importText, setNamespace
  });
})();
