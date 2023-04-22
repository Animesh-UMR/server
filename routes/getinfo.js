const { Configuration, OpenAIApi } = require("openai");
const express = require('express');
const app = express();
const router = express.Router();
require('dotenv').config();

router.get('/getinfo', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

router.post('/getinfo', (req, res) => {
    var keyword = req.body.keyword;
    async function callopenai() {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "user", content: "Write the definition of " + keyword + " and its Uses. Use heading <h1> with Keyword name" },
                // { role: "user", content: "Write a positive 1000 word essay on " + keyword + ". Use heading and Sub heading. For title use <h1> for heading use <h2> and for sub heading use <h3>. Do not write conclusion paragraph. Make sure the blog is not less than 750 words. Also do not mention that you are an ai." },
                // { role: "user", content: "Give me maximum companies for " + keyword + " market. Also try to give their website url and region. Use <li>" },
                // { role: "user", content: "Write SWOT analysis for " + keyword + " market." },
            ],
        });

        const completionone = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "user", content: "Write Technical analysis for " + keyword + ". Use <h2> for heading and use heading Technical Overview. " },
                //{ role: "user", content: "Write a market research report on " + keyword + " market. " },
                // { role: "user", content: "Give me maximum companies for " + keyword + " market. Also try to give their website url and region. Use <li>" },
                // { role: "user", content: "Write SWOT analysis for " + keyword + " market." },
            ],
        });

        const completiontwo = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "user", content: "Mention Parent market of " + keyword + " market. List down all the child market and sub child market. Make a tree structure of 3-4 level using <li> " },
                //{ role: "user", content: "Write a market research report on " + keyword + " market. " },
                // { role: "user", content: "Give me maximum companies for " + keyword + " market. Also try to give their website url and region. Use <li>" },
                // { role: "user", content: "Write SWOT analysis for " + keyword + " market." },
            ],
        });

        const completionthree = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "user", content: "List down all the companies known to you in " + keyword + " market. Also mention their website if possible." },
                //{ role: "user", content: "Write a market research report on " + keyword + " market. " },
                // { role: "user", content: "Give me maximum companies for " + keyword + " market. Also try to give their website url and region. Use <li>" },
                // { role: "user", content: "Write SWOT analysis for " + keyword + " market." },
            ],
        });


        res.write(completion.data.choices[0].message.content);
        res.write("<br>");
        res.write(completionone.data.choices[0].message.content);
        res.write("<br>");
        res.write(completiontwo.data.choices[0].message.content);
        res.write("<br>");
        res.write(completionthree.data.choices[0].message.content);
        res.write("<br>");
        res.end();

    }
    callopenai();


});

module.exports = router;