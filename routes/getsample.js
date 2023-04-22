const express = require('express');
const router = express.Router();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const app = express();
const fs = require('fs');
const officegen = require('officegen');
const JSZip = require('jszip');

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


const { OpenAIApi, Configuration } = require('openai');

router.get('/', (req, res) => {

    async function replaceKeywordsInSlide(slide, replacements) {
        let slideXML = await slide.async('string');

        // Iterate through the replacements and replace all instances of the keywords
        for (const [keyword, replacement] of Object.entries(replacements)) {
            const keywordRegex = new RegExp(keyword, 'g');
            slideXML = slideXML.replace(keywordRegex, replacement);
        }

        slide.dir = false;
        slide.name = 'ppt/slides/' + slide.name.match(/slide\d+/)[0] + '.xml';
        return slideXML;
    }

    // Read the PPTX file and parse it
    fs.readFile('sample1.pptx', async (err, data) => {
        if (err) throw err;

        // Load the PPTX content using JSZip
        const zip = new JSZip();
        const content = await zip.loadAsync(data);

        // Find all slide files
        const slideFiles = content.file(/ppt\/slides\/slide\d+\.xml/);

        // Define the keywords and their replacements
        const replacements = {
            'Canned Motor': 'Blockchain',
            'Executive Sumary1': 'Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello ',
        };

        // Iterate through all slides and apply the replacements
        const modifiedSlides = await Promise.all(
            slideFiles.map((slide) => replaceKeywordsInSlide(slide, replacements))
        );

        // Update the slide files in the PPTX content with the modified XML
        modifiedSlides.forEach((modifiedSlide, index) => {
            content.file(slideFiles[index].name, modifiedSlide);
        });

        // Generate the modified PPTX file
        const modifiedPPTX = await content.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

        // Save the modified PPTX file
        fs.writeFile('modified_sample.pptx', modifiedPPTX, (err) => {
            if (err) throw err;
            console.log('Modified presentation saved as modified_sample.pptx');
        });
    });
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
                { role: "user", content: "Create similar TOC for" + keyword + "market in html TOC format. For the segmentation, add as many segements as you can. Remove /n from output and for segmentation use, by type, by capacity, by end use, by industry, by region, by country and as many segments as you can" + toc },
            ],
        });

        var tocone = completion.data.choices[0].message.content;

        // const completiontoc = await openai.createChatCompletion({
        //     model: "gpt-3.5-turbo",
        //     messages: [
        //         { role: "user", content: "Continue the below ToC output and give 20 companies name if possible in company profile section" + tocone },
        //     ],
        // });

        res.write(completion.data.choices[0].message.content);
        // res.write(completiontoc.data.choices[0].message.content);
        res.end();

        let docx = officegen('docx')

        // Officegen calling this function after finishing to generate the docx document:
        docx.on('finalize', function (written) {
            console.log(
                'Finish to create a Microsoft Word document.'
            )
        })

        let pObj = docx.createP()

        pObj.addText(completion.data.choices[0].message.content)
        pObj.addText(completiontoc.data.choices[0].message.content)
        let out = fs.createWriteStream('tt.docx')
        docx.generate(out)


    }
    //callopenai();


});

module.exports = router;

