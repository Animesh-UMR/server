const express = require('express');
const router = express.Router();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const { OpenAIApi, Configuration } = require('openai');

router.get('/', (req, res) => {
    res.render("getsegments");
});

router.post('/', async (req, res) => {
    var keyword = req.body.keyword;

    // Connect to the mrdb database
    // mongoose.connect('mongodb+srv://animesh:RtnlAkI8pcSXdedj@cluster0.iiaaxkj.mongodb.net/mrdb?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

    // Create a schema and model for the keyword collection
    const KeywordsSchema = new mongoose.Schema({
        keyword: String,
    });

    const KeywordsModel = mongoose.models.Keyword || mongoose.model('Keyword', KeywordsSchema, 'keywords');

    // Define a flexible schema
    const Schema = mongoose.Schema;
    const flexibleSchema = new mongoose.Schema({
        Title: String,
        Defination: String,
        Segment: Schema.Types.Mixed,
        KeyPlayer: Schema.Types.Mixed,
        SWOT: Schema.Types.Mixed,
        DROT: Schema.Types.Mixed,
        PESTEL: Schema.Types.Mixed,
        PORTER: Schema.Types.Mixed,
        InvestorSentiments: String,
        ForecastYear: Number,
        BaseYear: Number,
        ReportType: String,
        ParentMarket: String,
        Geography: String,
    });

    // Create or use existing model
    const modelName = 'FlexibleData';
    const FlexibleModel = mongoose.models[modelName] || mongoose.model(modelName, flexibleSchema, 'reports');
    try {
        // Check if the keyword exists in the keyword collection
        const foundKeyword = await KeywordsModel.findOne({ keyword: keyword });

        if (!foundKeyword) {
            // Keyword not found in the keyword collection, show the message
            res.send("Keyword not in database. Please use the exact keyword.");
        } else {
            // Keyword found in the keyword collection, continue with the existing code
            const foundData = await FlexibleModel.findOne({ Title: keyword });

            if (foundData) {
                // Keyword found in the database, render sampleoutput with the found data
                res.render("sampleoutput", { items: JSON.stringify(foundData.Segment), keyword: keyword, keyplayer: JSON.stringify(foundData.KeyPlayer), swot: JSON.stringify(foundData.SWOT), drot: JSON.stringify(foundData.DROT), pestel: JSON.stringify(foundData.PESTEL), porter: JSON.stringify(foundData.PORTER), investorsentiments: foundData.InvestorSentiments, defination: foundData.Defination });
            } else {
                // Keyword not found in the database, call callopenai function
                callopenai();
            }
        }
    } catch (err) {
        console.error(err);
        res.send("Error occurred while searching for the keyword in the database.");
    }

    async function callopenai() {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        console.log(process.env.OPENAI_API_KEY);
        const openai = new OpenAIApi(configuration);
        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an ai researcher. Give output in JSON format. Give maximum segments possible. Do not use key in JSON to start with by. Use _ in key name if there are more than one word." },
                { role: "user", content: "Give output in JSON format. Use Segments keyword as top level object and its value is another object containing multiple key-value pairs. Do not use word by or numbering. Do not explain any sub segment. Directly start the output. Some example of the segements are types (Give maximum types), applications (Give maximum application) etc. Give all the possible segments of " + keyword + "market." },
            ],
        });
        const jsonData = JSON.parse(completion.data.choices[0].message.content);
        var Title = keyword;

        const keyplayer = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an ai researcher. Give output in JSON format. Never mention that you are an ai model. Use _ in key name if there are more than one word." },
                { role: "user", content: "Give output in JSON format. Give all the Major Player (10-20) in " + keyword + "market as per your knowledge. Use Key_Player keyword as top level object. Only give name of the key player no other information." },
            ],
        });

        const keyplayerData = JSON.parse(keyplayer.data.choices[0].message.content);

        const swot = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an ai researcher. Give output in JSON format. Never mention that you are an ai model. Use _ in key name if there are more than one word." },
                { role: "user", content: "Give output in JSON format. Give SWOT analysis on " + keyword + " market as per your knowledge. In this specific JSON format, each category of the SWOT analysis is represented by a key-value pair. The keys are the category names (Strengths, Weaknesses, Opportunities, and Threats), and the values are arrays that will contain the respective points (20-30 words) for each category." },
            ],
        });

        const swotData = JSON.parse(swot.data.choices[0].message.content);

        const drot = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an ai researcher. Give output in JSON format. Never mention that you are an ai model. Use _ in key name if there are more than one word." },
                { role: "user", content: "Give output in JSON format. Give DROTs on " + keyword + " market as per your knowledge. In this specific JSON format, each category of the DROTs is represented by a key-value pair. The keys are the category names (Drivers, Restraints, Opportunities, and Threats), and the values are arrays that will contain the respective points for each category." },
            ],
        });

        const drotData = JSON.parse(drot.data.choices[0].message.content);

        const pestel = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an ai researcher. Give output in JSON format. Never mention that you are an ai model. Use _ in key name if there are more than one word." },
                { role: "user", content: "Give output in JSON format. Give PESTEL analysis on " + keyword + " market as per your knowledge. In this specific JSON format, each category of the PESTEL analysis is represented by a key-value pair. The keys are the category names (Political, Economic, Sociocultural, Technological, Environmental and Legal), and the values are arrays that will contain the respective points for each category." },
            ],
        });

        const pestelData = JSON.parse(pestel.data.choices[0].message.content);

        const porter = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an ai researcher. Give output in JSON format. Never mention that you are an ai model. Use _ in key name if there are more than one word." },
                { role: "user", content: "Give output in JSON format. Give PORTER Five force analysis on " + keyword + " market as per your knowledge. In this specific JSON format, each category of the PORTER analysis is represented by a key-value pair. The keys are the category names (CompetitiveRivalry, ThreatOfNewEntrants, ThreatOfSubstitutes, BargainingPowerOfSuppliers, and BargainingPowerOfBuyers), and the values are arrays that will contain the respective points for each category." },
            ],
        });

        const porterData = JSON.parse(porter.data.choices[0].message.content);

        const investorSentiments = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an ai researcher. Give answers direct and to the point and reason. I want investor sentiments for markets. There are 3 type of investor sentiments. High: Investors are willing to invest in this market, Medium: Investors are bit confused about this market, Low: Investors are not willing to invest in this market. Never mention that you are an ai model" },
                { role: "user", content: "Give market sentiments for " + keyword + " market." },
            ],
        });

        const investorSentimentsData = investorSentiments.data.choices[0].message.content;

        const defination = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an ai researcher. Give answers direct and to the point. Never mention that you are an ai model" },
                { role: "user", content: "Give proper defination and usage of " + keyword + ". Keep the output between 100-200 words " },
            ],
        });

        const definationData = defination.data.choices[0].message.content;




        const ParentMarket = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are an ai researcher. Give answers direct and to the point and give no reason. Do not mention that you are an ai model. " },
                { role: "user", content: "Give parent market for " + keyword + " market." },
            ],
        });

        const ParentMarketData = ParentMarket.data.choices[0].message.content;

        // Define a flexible schema
        const Schema = mongoose.Schema;
        const flexibleSchema = new Schema({
            Title: String,
            Defination: String,
            Segment: Schema.Types.Mixed,
            KeyPlayer: Schema.Types.Mixed,
            SWOT: Schema.Types.Mixed,
            DROT: Schema.Types.Mixed,
            PESTEL: Schema.Types.Mixed,
            PORTER: Schema.Types.Mixed,
            InvestorSentiments: String,
            ForecastYear: Number,
            BaseYear: Number,
            ReportType: String,
            ParentMarket: String,
            Geography: String,


        });

        const ForecastYear = 2033;  // 2023 to 2033
        const BaseYear = 2022;
        const ReportType = "PDF";
        const Geography = "Global";


        // Create or use existing model
        const modelName = 'FlexibleData';
        const FlexibleModel = mongoose.models[modelName] || mongoose.model(modelName, flexibleSchema, 'reports');

        (async () => {
            try {
                // Create a new document and save it
                const newFlexibleData = new FlexibleModel({ Segment: jsonData, Title: Title, KeyPlayer: keyplayerData, SWOT: swotData, DROT: drotData, PESTEL: pestelData, PORTER: porterData, InvestorSentiments: investorSentimentsData, ForecastYear: ForecastYear, BaseYear: BaseYear, ReportType: ReportType, ParentMarket: ParentMarketData, Geography: Geography, Defination: definationData });
                const savedData = await newFlexibleData.save();
                console.log('Document saved:', savedData);
            } catch (err) {
                console.error(err);
            } finally {
                // mongoose.connection.close();
            }
        })();
        res.render("sampleoutput", { items: JSON.stringify(jsonData), keyword: keyword, keyplayer: JSON.stringify(keyplayerData), swot: JSON.stringify(swotData), drot: JSON.stringify(drotData), pestel: JSON.stringify(pestelData), porter: JSON.stringify(porterData), investorSentiments: investorSentimentsData, ParentMarket: ParentMarketData, defination: definationData });


    }

});

module.exports = router;

