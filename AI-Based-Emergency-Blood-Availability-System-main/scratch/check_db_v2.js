import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

async function checkDonors() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to DB");
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    const donorsColl = db.collection('donors');
    const count = await donorsColl.countDocuments();
    console.log("Total Donors (Native Count):", count);
    
    if (count > 0) {
      const allDonors = await donorsColl.find({}).limit(10).toArray();
      console.log("Recent Donors (Native Find):");
      allDonors.forEach(d => {
        console.log(`- ID: ${d._id}, Name: ${d.name}, Blood: ${d.bloodGroup}, City: ${d.city}, Location: ${JSON.stringify(d.location)}`);
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

checkDonors();
