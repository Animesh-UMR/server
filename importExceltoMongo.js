require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const readExcelFile = require('read-excel-file/node');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function main() {
    console.log("running import script")
    try {
        await client.connect();
        const db = client.db('mrdb');
        const keywordsCollection = db.collection('keywords');

        // Read the Excel file
        const rows = await readExcelFile('datakeyword.xlsx', { sheet: 1 });

        // Remove the header row
        rows.shift();

        // Convert rows to documents
        const documents = rows.map(([id, keyword]) => ({ id, keyword }));

        // Insert documents into the 'keywords' collection
        await keywordsCollection.insertMany(documents);

        console.log('Data imported successfully');
    } catch (err) {
        console.error('Error importing data:', err);
    } finally {
        await client.close();
    }
}

main();