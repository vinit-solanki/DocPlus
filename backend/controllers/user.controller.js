const { Clerk } = require('@clerk/clerk-sdk-node');

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

exports.updateUserMetadata = async (req, res) => {
  const { userId, name, phone, address, gender, dob, bloodGroup } = req.body;

  try {
    const user = await clerk.users.updateUser(userId, {
      publicMetadata: {
        fullName: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
        gender: gender || undefined,
        dob: dob || undefined,
        bloodGroup: bloodGroup || undefined,
      },
    });

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    res.status(500).json({ message: 'Failed to update profile. Please try again.', error: error.message });
  }
};