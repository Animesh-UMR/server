const express = require('express');
const router = express.Router();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


const { OpenAIApi, Configuration } = require('openai');

router.get('/', (req, res) => {
    res.render("parentmarket");

});

router.post('/', (req, res) => {
    var keyword = req.body.keyword;


    async function callopenai() {
        const configuration = new Configuration({
            apiKey: "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",
        });
        const openai = new OpenAIApi(configuration);
        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                // { role: "user", content: "I have getparentmarket.js in nodejs. This file gives javascript object as output. Now I want to render this javascript object output in parentmarket.ejs using gojs. Can you give me code for this problem." },
                { role: "user", content: "Find parent market for " + keyword + " market. Then find 10 child markets for parent market. Also include CAGR value as per you for each child markets. Give output only in JSON format. From parent market use key as parent_market and for child market use key as child_markets and child_market for single child market. and for CAGR use CAGR_value as key. Do not write any text. Also do not use any speical char apart from:" },
            ],
        });

        //myVar = [];
        // const obj = completion.data.choices[0].message.content;
        const obj = JSON.parse(completion.data.choices[0].message.content);
        console.log(obj);

        //res.write(completion.data.choices[0].message.content);
        res.render('marketmap', { obj: obj });
        res.end();
    }
    callopenai();


});

module.exports = router;

