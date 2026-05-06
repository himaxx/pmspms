import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// Configuration from Vercel Environment Variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SPREADSHEET_ID = process.env.VITE_SHEET_ID;

// Define the schema for our 6 sub-sheets with exact headers and filtering logic
const SHEETS_CONFIG = [
    {
        name: 'New Requirements',
        headers: ['Timestamp', 'Manual Job Number', 'Your Name', 'Item Name', 'Sizes', 'Quantity', 'Order Ka Maal hai Ya Refill ka?', 'Koi Special Instructions', 'Item Group'],
        columns: ['date', 'job_no', 'prog_by', 'item', 'size', 'qty', 'reason', 'special_instruction', 'item_group'],
        filter: (job) => job.date != null
    },
    {
        name: 'Production Approval',
        headers: ['Timestamp', 'Manual Job Number', 'Ye Maal Production pe bhejna hai kya ?', 'Maal in house katega'],
        columns: ['s2_actual', 'job_no', 's2_yes_no', 's2_inhouse'],
        filter: (job) => job.s2_actual != null || job.s2_yes_no != null
    },
    {
        name: 'Inhouse Cutting',
        headers: ['Timestamp', 'Manual Job Number', 'Actual Cutting Pieces', 'Size Wise Details', 'Cutting Person'],
        columns: ['s3_actual', 'job_no', 's3_dukan_cutting', 's3_size_details', 's3_cutting_person'],
        filter: (job) => job.s3_actual != null || job.s3_dukan_cutting != null
    },
    {
        name: 'Naame',
        headers: ['Timestamp', 'Manual Job Number', 'Thekedat/Karigar Name', 'Cut To Pack', 'Maal approx kitne din me jama hoga?', 'Cutting Pieces', 'Size wise details'],
        columns: ['s4_start_date', 'job_no', 's4_thekedar', 's4_cut_to_pack', 's4_lead_time', 's4_cutting_pcs', 'size'],
        filter: (job) => job.s4_start_date != null || job.s4_thekedar != null
    },
    {
        name: 'Jama',
        headers: ['Timestamp', 'Manual Job Number', 'Jama Quantity', 'Maal Press Hoke Jama Hua ya Nahi'],
        columns: ['s5_actual', 'job_no', 's5_jama_qty', 's5_press'],
        filter: (job) => job.s5_actual != null || job.s5_jama_qty != null
    },
    {
        name: 'Settle',
        headers: ['Timestamp', 'Manual Job Number', 'Settle Quantity', 'Reason', 'Your Name'],
        columns: ['s5_actual', 'job_no', 's6_settle_qty', 's6_reason', 's6_name'], // DB doesn't store a separate timestamp for settle, so we fallback to s5_actual or empty
        filter: (job) => job.s6_name != null || job.s6_settle_qty != null
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
                requestBody: { values: [config.headers] }
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
            const rows = jobs
                .filter(config.filter)
                .map(job => config.columns.map(col => formatValue(job[col])));
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
