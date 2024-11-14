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

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
