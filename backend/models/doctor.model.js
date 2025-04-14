import mongoose from "mongoose";
import DoctorSchema from "../schemas/doctors.schema.js";

const doctorModel = mongoose.model("doctor", DoctorSchema);
export default doctorModel;