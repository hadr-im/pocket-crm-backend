const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const dotenv = require('dotenv')
dotenv.config()

const app = express();
const port = process.env.PORT || 3000;

// Path to your service account key file
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'API_credentials.json');

// The ID of your Google Sheet (from the URL)
const SPREADSHEET_ID = process.env.SPREADSHEETID;

// Scopes for the API (read/write access)
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Authenticate using the service account credentials
const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: SCOPES
});

// Function to read data from Google Sheets
async function readData(range) {
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
    });
    return result.data.values;
}

// Function to write data to Google Sheets
async function writeData(range, values) {
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    const result = await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: { values: values },
    });
    return result;
}

// API route to read data from Google Sheets
app.get('/read', async (req, res) => {
    try {
        const range = '📞 Contact List!B8:F22';  
        const data = await readData(range);
        res.json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API route to write data to Google Sheets
app.post('/write', express.json(), async (req, res) => {
    try {
        const range = '📞 Contact List!B22';  // Modify the range according to your needs
        const values = req.body.values || [
            ['Majd Aguir', 'OCVP SALES', '97179960','majdaguir29@aiesec.net','Sahloul']
        ];
        const result = await writeData(range, values);
        res.json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// Function to get all leads from the Google Sheet
async function listLeads() {
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    const range = 'SALES CRM!A3:C';  // Adjust range based on where your leads are located
    
    try {
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });
        
        const rows = result.data.values;
        if (!rows || rows.length === 0) {
            return [];
        }

        // Map rows to objects for easier processing
        const leads = rows.map(row => ({
            userName: row[0],
            leadName: row[2],
        }));
        
        return leads;

    } catch (error) {
        console.error("Error fetching data from Google Sheets:", error);
        throw error;
    }
}

// API route to get all leads
app.get('/leads', async (req, res) => {
    try {
        const leads = await listLeads();
        res.json({ leads });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve leads' });
    }
});




// Function to get all leads of a specific user from Google Sheets
async function listLeadsByUser(userName) {
    const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
    const range = 'SALES CRM!A3:C';  // Adjust range based on where your leads are located
    
    try {
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });
        
        const rows = result.data.values;
        if (!rows || rows.length === 0) {
            return [];
        }

        // Filter rows to include only leads of the specified user
        const userLeads = rows
            .filter(row => row[0] === userName)  // Filter by userName (assuming userName is in the second column)
            .map(row => ({
                userName: row[0],
                leadName: row[2],
            }));
        
        return userLeads;

    } catch (error) {
        console.error("Error fetching data from Google Sheets:", error);
        throw error;
    }
}

// API route to get all leads for a specific user
app.get('/Sleads', async (req, res) => {
    const userName = req.query.userName;
    
    if (!userName) {
        return res.status(400).json({ error: 'User Name is required as a query parameter.' });
    }

    try {
        const leads = await listLeadsByUser(userName);
        res.json({ leads });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve leads for the specified user.' });
    }
});


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
