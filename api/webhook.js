import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// Configuration from Vercel Environment Variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SPREADSHEET_ID = process.env.VITE_SHEET_ID;

// Define the schema for our 6 sub-sheets
const SHEETS_CONFIG = [
    {
        name: 'New Requirements',
        columns: ['job_no', 'date', 'prog_by', 'item', 'item_group', 'size', 'qty', 'reason', 'special_instruction']
    },
    {
        name: 'Production Approval',
        columns: ['job_no', 'item', 's2_planned', 's2_actual', 's2_yes_no', 's2_instructions', 's2_inhouse', 's2_delay', 's2_approver']
    },
    {
        name: 'Inhouse Cutting',
        columns: ['job_no', 'item', 's3_planned', 's3_actual', 's3_dukan_cutting', 's3_size_details', 's3_cutting_person', 's3_delay']
    },
    {
        name: 'Naame',
        columns: ['job_no', 'item', 's4_planned', 's4_start_date', 's4_thekedar', 's4_cutting_pcs', 's4_cut_to_pack', 's4_lead_time', 's4_delay', 's5_jama_planned']
    },
    {
        name: 'Jama',
        columns: ['job_no', 'item', 's5_actual', 's5_jama_qty', 's5_press', 's5_status', 's5_delay', 's5_jama_trail']
    },
    {
        name: 'Settle',
        columns: ['job_no', 'item', 's6_settle_qty', 's6_reason', 's6_name']
    }
];

// Helper: Format data for Google Sheets
function formatValue(val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return val;
}

export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY || !SPREADSHEET_ID || !process.env.GOOGLE_CREDENTIALS) {
        return res.status(500).json({ error: 'Missing required environment variables in Vercel.' });
    }

    try {
        console.log(`[${new Date().toISOString()}] Executing Google Sheets Sync on Vercel...`);

        // Initialize Supabase Client
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        // Initialize Google Auth from the Vercel Environment Variable
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
        const sheetsApi = google.sheets({ version: 'v4', auth });

        // 1. Ensure sheets exist
        const spreadsheet = await sheetsApi.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);

        for (const config of SHEETS_CONFIG) {
            if (!existingSheets.includes(config.name)) {
                await sheetsApi.spreadsheets.batchUpdate({
                    spreadsheetId: SPREADSHEET_ID,
                    requestBody: { requests: [{ addSheet: { properties: { title: config.name } } }] }
                });
            }
            // Ensure headers are present
            await sheetsApi.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${config.name}!A1`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [config.columns] }
            });
        }

        // 2. Fetch all jobs from Supabase
        const { data: jobs, error } = await supabase
            .from('jobs')
            .select('*')
            .order('job_no', { ascending: false });

        if (error) throw error;

        // 3. Clear and rewrite data for each sheet
        for (const config of SHEETS_CONFIG) {
            const rows = jobs.map(job => config.columns.map(col => formatValue(job[col])));
            if (rows.length === 0) continue;

            await sheetsApi.spreadsheets.values.clear({
                spreadsheetId: SPREADSHEET_ID,
                range: `${config.name}!A2:Z`,
            });

            await sheetsApi.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${config.name}!A2`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: rows }
            });
        }

        console.log(`[${new Date().toISOString()}] Sync Completed Successfully!`);
        return res.status(200).json({ message: 'Sync Completed Successfully!' });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Sync Failed:`, error.message);
        return res.status(500).json({ error: error.message });
    }
}
