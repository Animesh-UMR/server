const express = require('express');
const router = express.Router();
const officegen = require('officegen')
const fs = require('fs')
const path = require('path');
const { OpenAIApi, Configuration } = require('openai');
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

router.get('/', (req, res) => {
    res.render("blogs");
});

router.post('/', (req, res) => {
    // Array of keywords
    const keywords = [
        "Aluminum Alloy Extrusion Profile ",
        "Middle East Spiral Welded Pipe",
        "Atomic Layer Deposition Equipment",
        "Spent Nuclear Fuel Dry Storage Cask",
        "Fluorspar",
        "Cannabidiol (CBD)",
        "Flow Computer",
        "APET Sheet",
        "Macadamia",
        "Global Penetrating Oil",
        "Electric Bidet",
        "Aircraft Insulation Materials",
        "Robotic Vacuum Cleaners",
        "Containerboard",
        "Mining Equipment and Machinery",
        "Veterinary Point of Care Blood Gas Analyzers",
        "Carbon Fiber & Carbon Fiber Reinforced Plastic",
        "Passenger Stairs",
        "PET Shrink Film",
        "Manufacturing Houses",
        "Building Automation System",
        "Barbecue Grills",
        "Friction Stir Welding Equipment",
        "Backer Board",
        "Prosthetic Joint Infections Treatment",
        "Alkyl Ketene Dimer (AKD)",
        "Nitinol-based Medical Device",
        "Rotary Tiller",
        "Orthopedic Screws",
        "Scoliosis Braces",
        "Construction and Demolition Robots",
        "Metal Spare Parts",
        "Silica Sand",
        "Hydraulic Pumps",
        "Air Release Valves",

    ];

    // Iterate through the keywords array and call callopenai() for each keyword
    for (const keyword of keywords) {
        callopenai(keyword);
    }

    res.end();
});

async function callopenai(keyword) {
    const configuration = new Configuration({
        apiKey: "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",
    });
    const openai = new OpenAIApi(configuration);
    const completion = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
            { role: "user", content: "Create a positive blog on " + keyword + ". Write a title as well. Do not write conclusion paragraph. Make sure the blog is not less than 750 words. Also do not mention that you are an ai." },
        ],
    });

    let docx = officegen('docx')

    // Officegen calling this function after finishing to generate the docx document:
    docx.on('finalize', function (written) {
        console.log(
            'Finish to create a Microsoft Word document for keyword: ' + keyword
        )
    })

    let pObj = docx.createP()

    pObj.addText(completion.data.choices[0].message.content)
    let out = fs.createWriteStream(keyword + ' blog.docx')
    docx.generate(out)
}

module.exports = router;