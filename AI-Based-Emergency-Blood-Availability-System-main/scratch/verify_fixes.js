import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Donor from '../backend/models/Donor.js';

dotenv.config({ path: './backend/.env' });

async function verifySearch() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected for verification");
    
    const bloodGroupSearch = "b+"; // lowercase
    const normalizedBG = bloodGroupSearch.replace(/\+/g, '\\+');
    const query = { 
      bloodGroup: { $regex: `^${normalizedBG}$`, $options: "i" } 
    };
    
    console.log("Searching with query:", JSON.stringify(query));
    const results = await Donor.find(query);
    console.log(`Found ${results.length} donors matching 'b+'`);
    results.forEach(d => console.log(`- ${d.name} (${d.bloodGroup})`));
    
    const locationSearch = "hyderabad"; // lowercase
    const locQuery = {
      $or: [
        { "city": { $regex: locationSearch, $options: "i" } },
        { "location.city": { $regex: locationSearch, $options: "i" } },
        { "location": { $regex: locationSearch, $options: "i" } }
      ]
    };
    console.log("Searching with location query:", JSON.stringify(locQuery));
    const locResults = await Donor.find(locQuery);
    console.log(`Found ${locResults.length} donors matching 'hyderabad'`);
    locResults.forEach(d => console.log(`- ${d.name} (${d.location?.city || d.location || d.city})`));

    process.exit(0);
  } catch (err) {
    console.error("Verification failed:", err.message);
    process.exit(1);
  }
}

verifySearch();
