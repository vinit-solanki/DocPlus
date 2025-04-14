import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true,
    },
    password: {
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        minLength: 10
    },
    speciality: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    },
    address: {
        type: Object,
        required: true,
    },
    date: {
        type: Number,
        required: true,
    },
    fees: {
        type: Number,
        required: true,
    },
    slot_booked: {
        type: Object,
        required: true,
        default: {}
    }
}, { timestamps: true, minimize: false });

export default DoctorSchema;