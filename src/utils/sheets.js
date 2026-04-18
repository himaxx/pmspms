import { FMS_COLUMNS } from './constants.js';

// ─── Env vars (Vite) ─────────────────────────────────────────────────────────
const SHEET_ID  = import.meta.env.VITE_SHEET_ID;
const API_KEY   = import.meta.env.VITE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// ─── 0. findRowIndex ────────────────────────────────────────────────────────
/**
 * Find the 1-based row index for a given job number in the FMS sheet.
 * Assumes headers are 3 rows deep, and search happens in column A.
 */
export async function findRowIndex(jobNumber) {
  const rows = await readSheet('FFMS', 'A1:A5000'); // Fetch just column A
  const matchIdx = rows.findIndex(
    (row, idx) => idx >= 3 && String(row[0]).trim() === String(jobNumber).trim()
  );
  return matchIdx !== -1 ? matchIdx + 1 : -1;
}

// ─── Internal auth state ──────────────────────────────────────────────────────
let _accessToken = null;
let _tokenClient = null;

/**
 * Load Google Identity Services script dynamically (once),
 * initialise the token client and request a fresh access token.
 * Resolves when a valid token has been stored in memory.
 */
export function initGoogleAuth() {
  return new Promise((resolve, reject) => {
    // If we already have a valid token, resolve immediately.
    if (_accessToken) return resolve(_accessToken);

    const initClient = () => {
      // eslint-disable-next-line no-undef
      _tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error));
            return;
          }
          _accessToken = tokenResponse.access_token;
          resolve(_accessToken);
        },
      });
      _tokenClient.requestAccessToken({ prompt: '' });
    };

    // Load the GIS script only once.
    if (document.getElementById('gis-script')) {
      initClient();
      return;
    }

    const script = document.createElement('script');
    script.id  = 'gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = initClient;
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
    document.head.appendChild(script);
  });
}

/** Returns true if an access token is currently held in memory. */
export function isAuthenticated() {
  return !!_accessToken;
}

// ─── 1. readSheet ─────────────────────────────────────────────────────────────
/**
 * Read values from a named range in the spreadsheet (API key — read-only, no auth needed).
 * @param {string} sheetName  - Sheet tab name, e.g. 'FMS'
 * @param {string} range      - A1 notation range, e.g. 'A1:AV'
 * @returns {Promise<string[][]>} Array of row arrays
 */
export async function readSheet(sheetName, range) {
  if (!SHEET_ID || !API_KEY) {
    throw new Error('Missing VITE_SHEET_ID or VITE_API_KEY in .env.local — restart dev server after adding them.');
  }

  const encodedRange = encodeURIComponent(`${sheetName}!${range}`);
  const url = `${SHEETS_BASE}/${SHEET_ID}/values/${encodedRange}?key=${API_KEY}`;

  let res;
  try {
    res = await fetch(url);
  } catch (networkErr) {
    throw new Error(`Network error — no internet or CORS blocked: ${networkErr.message}`);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message ?? res.statusText;
    throw new Error(`Google Sheets API [${res.status}]: ${msg}`);
  }

  const data = await res.json();
  return data.values ?? [];
}

// ─── 2. appendRow ─────────────────────────────────────────────────────────────
/**
 * Append a row to the given sheet (requires OAuth).
 * @param {string}   sheetName - Sheet tab name
 * @param {string[]} rowData   - Array of values matching the sheet's columns
 */
export async function appendRow(sheetName, rowData) {
  if (!isAuthenticated()) await initGoogleAuth();

  const encodedRange = encodeURIComponent(`${sheetName}!A1`);
  const url =
    `${SHEETS_BASE}/${SHEET_ID}/values/${encodedRange}:append` +
    `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${_accessToken}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ values: [rowData] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`appendRow failed [${res.status}]: ${err?.error?.message ?? res.statusText}`);
  }

  return res.json();
}

// ─── 2.5 updateRow ────────────────────────────────────────────────────────────
/**
 * Update an existing row in the FMS sheet.
 * @param {number} rowIndex - 1-based row index
 * @param {string[]} rowData - Full row array
 */
export async function updateRow(rowIndex, rowData) {
  if (!isAuthenticated()) await initGoogleAuth();

  const range = `FFMS!A${rowIndex}:AV${rowIndex}`;
  const encodedRange = encodeURIComponent(range);
  const url = `${SHEETS_BASE}/${SHEET_ID}/values/${encodedRange}?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${_accessToken}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      range: range,
      majorDimension: 'ROWS',
      values: [rowData],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`updateRow failed [${res.status}]: ${err?.error?.message ?? res.statusText}`);
  }

  return res.json();
}


// ─── Helper: map a raw row array → job object ────────────────────────────────
function rowToJob(row) {
  const obj = {};
  for (const [key, colIndex] of Object.entries(FMS_COLUMNS)) {
    obj[key] = row[colIndex] ?? '';
  }
  return obj;
}

// ─── 3. getJobFromFMS ─────────────────────────────────────────────────────────
/**
 * Find a single job in the FMS sheet by job number.
 * Rows 0-2 are headers; data starts at row 3 (0-indexed).
 * @param {string|number} jobNumber
 * @returns {Promise<Object|null>}
 */
export async function getJobFromFMS(jobNumber) {
  const rows = await readSheet('FFMS', 'A1:AV');
  const dataRows = rows.slice(3); // skip 3 header rows

  const match = dataRows.find(
    (row) => String(row[FMS_COLUMNS.jobNo]).trim() === String(jobNumber).trim()
  );

  return match ? rowToJob(match) : null;
}

// ─── 4. getAllJobs ────────────────────────────────────────────────────────────
/**
 * Fetch all jobs from the FMS sheet, skipping header rows and empty rows.
 * @returns {Promise<Object[]>} Sorted by jobNo descending
 */
export async function getAllJobs() {
  const rows = await readSheet('FFMS', 'A1:AV');
  const dataRows = rows.slice(3); // skip 3 header rows

  return dataRows
    .filter((row) => row[FMS_COLUMNS.jobNo] && String(row[FMS_COLUMNS.jobNo]).trim() !== '')
    .map(rowToJob)
    .sort((a, b) => {
      // Sort numerically if possible, otherwise lexicographically descending
      const nA = Number(a.jobNo);
      const nB = Number(b.jobNo);
      if (!isNaN(nA) && !isNaN(nB)) return nB - nA;
      return String(b.jobNo).localeCompare(String(a.jobNo));
    });
}
