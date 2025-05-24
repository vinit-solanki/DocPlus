const Patient = require("../models/Patient")
const User = require("../models/User")

const createPatient = async (req, res) => {
  try {
    const { userId } = req.user
    const { name, email, phone, address, gender, dob, bloodGroup } = req.body

    console.log("Creating/updating patient for userId:", userId)
    console.log("Request body:", req.body)

    let patient = await Patient.findOne({ user: userId })

    if (!patient) {
      // Create new patient
      patient = new Patient({
        user: userId,
        name,
        email,
        phone,
        address,
        gender,
        dob,
        bloodGroup,
      })

      console.log("Creating new patient profile")
    } else {
      // Update existing patient
      patient.name = name || patient.name
      patient.email = email || patient.email
      patient.phone = phone || patient.phone
      patient.address = address || patient.address
      patient.gender = gender || patient.gender
      patient.dob = dob || patient.dob
      patient.bloodGroup = bloodGroup || patient.bloodGroup

      console.log("Updating existing patient profile")
    }

    await patient.save()

    // Update user's profileId reference if it doesn't exist
    const user = await User.findById(userId)
    if (user && !user.profileId) {
      user.profileId = patient._id
      await user.save()
      console.log("Updated user profileId reference")
    }

    console.log("Patient saved successfully:", patient._id)
    res.json(patient)
  } catch (error) {
    console.error("Error saving patient:", error)
    res.status(500).json({ message: "Error saving patient", error: error.message })
  }
}

const getPatient = async (req, res) => {
  try {
    const { userId } = req.user
    console.log("Fetching patient for userId:", userId)

    const patient = await Patient.findOne({ user: userId })
    if (!patient) {
      console.log("No patient found for userId:", userId)
      return res.status(404).json({
        message: "Patient profile not found. Please create your profile first.",
        requiresProfile: true,
      })
    }

    console.log("Patient found:", patient._id)
    res.json(patient)
  } catch (error) {
    console.error("Error fetching patient data:", error)
    res.status(500).json({ message: "Error fetching patient data", error: error.message })
  }
}

// New function for backward compatibility with /:userId route
const getPatientById = async (req, res) => {
  try {
    const { userId: paramUserId } = req.params
    const { userId: authUserId } = req.user

    // Security check: only allow users to access their own data
    if (paramUserId !== authUserId) {
      return res.status(403).json({ message: "Access denied" })
    }

    const patient = await Patient.findOne({ user: authUserId })
    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found. Please create your profile first.",
        requiresProfile: true,
      })
    }

    res.json(patient)
  } catch (error) {
    console.error("Error fetching patient data:", error)
    res.status(500).json({ message: "Error fetching patient data", error: error.message })
  }
}

const updatePatient = async (req, res) => {
  try {
    const { userId } = req.user
    const { name, email, phone, address, gender, dob, bloodGroup } = req.body

    console.log("Updating patient for userId:", userId)

    const patient = await Patient.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          name,
          email,
          phone,
          address,
          gender,
          dob,
          bloodGroup,
        },
      },
      { new: true, upsert: false },
    )

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found. Please create your profile first.",
        requiresProfile: true,
      })
    }

    console.log("Patient updated successfully:", patient._id)
    res.json(patient)
  } catch (error) {
    console.error("Error updating patient data:", error)
    res.status(500).json({ message: "Error updating patient data", error: error.message })
  }
}

module.exports = {
  createPatient,
  getPatient,
  getPatientById,
  updatePatient,
}
