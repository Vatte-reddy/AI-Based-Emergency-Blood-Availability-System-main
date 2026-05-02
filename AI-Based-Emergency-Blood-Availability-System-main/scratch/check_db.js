import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Donor from '../backend/models/Donor.js';

dotenv.config({ path: './backend/.env' });

async function checkDonors() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bloodhub');
    console.log("Connected to DB");
    const donors = await Donor.find({});
    console.log("Total Donors in DB:", donors.length);
    donors.forEach(d => {
      console.log(`- Name: ${d.name}, Blood: ${d.bloodGroup}, City: ${d.city}, LocCity: ${d.location?.city || d.location}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDonors();
