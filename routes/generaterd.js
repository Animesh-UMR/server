const express = require('express');
const router = express.Router();
const officegen = require('officegen')
const fs = require('fs')
const path = require('path');
const { OpenAIApi, Configuration } = require('openai');
const app = express();
const bodyParser = require("body-parser");
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
//app.set("view engine", "ejs");

router.get('/', (req, res) => {
    // res.render("blogs");

    async function callopenai() {
        const configuration = new Configuration({
            apiKey: "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",
        });
        const openai = new OpenAIApi(configuration);
        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "user", content: "Write a 400 word on Digital Crosspoint Switches Market. Try to include CAGR value and Market Value. If these values are not available, just write xx in place of value. Then define what is Digital Crosspoint Switches. Do Not write about types, applications or major players. " },
            ],
        });

        res.write(completion.data.choices[0].message.content);
        res.end();

        let docx = officegen('docx')

        // // Officegen calling this function after finishing to generate the docx document:
        // docx.on('finalize', function (written) {
        //     console.log(
        //         'Finish to create a Microsoft Word document.'
        //     )
        // })

        // let pObj = docx.createP()

        // pObj.addText(completion.data.choices[0].message.content)
        // let out = fs.createWriteStream(keyword + ' blog.docx')
        // docx.generate(out)


    }
    callopenai();

});

router.post('/', (req, res) => {
    var keyword = req.body.keyword;
    async function callopenai() {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "user", content: "Write a 200 word on Digital Crosspoint Switches Market. Include CAGR and Market Value." },
            ],
        });

        res.write(completion.data.choices[0].message.content);
        res.end();

        let docx = officegen('docx')

        // // Officegen calling this function after finishing to generate the docx document:
        // docx.on('finalize', function (written) {
        //     console.log(
        //         'Finish to create a Microsoft Word document.'
        //     )
        // })

        // let pObj = docx.createP()

        // pObj.addText(completion.data.choices[0].message.content)
        // let out = fs.createWriteStream(keyword + ' blog.docx')
        // docx.generate(out)


    }
    callopenai();


});

module.exports = router;