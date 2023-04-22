const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true,
    },
    Description: String,
    Date: String,
    Keywords: String,
    SinglePrice: Number,
    MultiplePrice: Number,
    CorporatePrice: Number,
    Pages: Number,
    Category: String,
    SubCategory: String,
    Publisher: String,
    Pages: Number,
    ReportType: String,
    ReportFormat: String,
    DeliveryTime: String,
    ReportStatus: String,
    ReportLink: String,
    ReportImage: String,
    Segments: String,
    Geography: String,
    Companies: String,
    Countries: String,
    Regions: String,
    Types: String,
    Applications: String,
    Technologies: String,
    EndUsers: String,
});

const ReportModel = mongoose.model('reports', reportSchema);
module.exports = ReportModel;


