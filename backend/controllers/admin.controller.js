import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary';
import doctorModel from '../models/doctor.model.js';

const addDoctor = async (req, res) => {
    try {
      console.log("Headers:", req.headers);
      console.log("Content-Type:", req.headers['content-type']);
      console.log("Body:", req.body);
      console.log("File:", req.file);
  
      const {
        name, email, password, speciality, degree,
        experience, about, phone, fees, address
      } = req.body;
  
      const imageFile = req.file;
      
      if(!name || !email || !password || !speciality || !degree || !experience || !about || !phone || !fees || !address) {
        return res.status(400).json({ success:false, error: 'All fields are required' });
      }
      if(!validator.isEmail(email)){
        return res.status(400).json({ success:false, error: 'Invalid email address' });
      }
      if(!validator.isMobilePhone(phone, 'any', { strictMode: false })){
        return res.status(400).json({ success:false, error: 'Invalid phone number' });
      }
      if(password.length < 6){
        return res.status(400).json({ success:false, error: 'Password must be at least 6 characters long' });
      }
    //   hashing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // upload image to cloudinary 
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"});
    const imageUrl = imageUpload.secure_url;
    
    const doctorData = {
        name, email, password: hashedPassword, speciality, degree,
        experience, about, phone, fees, address, image: imageUrl, date: Date.now()
    }
    const doctor =  new doctorModel(doctorData);
    if(!doctor){
        return res.status(400).json({ success:false, error: 'Doctor not created' });
    }
    await doctor.save();
    res.status(200).json({ success:true, message: 'Doctor created successfully', doctor });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
export default addDoctor;