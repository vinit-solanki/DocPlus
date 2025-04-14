const mongoose = require('mongoose');

const DiseaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    symptoms: [{
        type: String
    }],
    specialistType: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Disease", DiseaseSchema);