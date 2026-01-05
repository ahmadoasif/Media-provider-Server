// Test script to verify reviews were created
import mongoose from 'mongoose';

const MONGO_URI = "mongodb://127.0.0.1:27017/auth_db";

async function testReviews() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const Review = mongoose.model('Review', new mongoose.Schema({
      reviewId: String,
      userId: mongoose.Schema.Types.ObjectId,
      propertyId: mongoose.Schema.Types.ObjectId,
      vendorId: mongoose.Schema.Types.ObjectId,
      ratings: {
        staff: Number,
        facilities: Number,
        cleanliness: Number,
        comfort: Number,
        valueForMoney: Number,
        location: Number,
        overall: Number
      },
      review: String,
      status: String
    }));

    const reviews = await Review.find({}).populate('userId', 'firstName lastName').populate('propertyId', 'propertyName');
    
    console.log(`\n📊 Found ${reviews.length} reviews:`);
    
    reviews.forEach((review, index) => {
      console.log(`\n--- Review ${index + 1} ---`);
      console.log(`Review ID: ${review.reviewId}`);
      console.log(`User: ${review.userId?.firstName} ${review.userId?.lastName}`);
      console.log(`Property: ${review.propertyId?.propertyName}`);
      console.log(`Vendor ID: ${review.vendorId}`);
      console.log(`Overall Rating: ${review.ratings.overall}/10`);
      console.log(`Status: ${review.status}`);
      console.log(`Review: "${review.review}"`);
      console.log(`Ratings:`, review.ratings);
    });

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");

  } catch (err) {
    console.error("❌ Error:", err);
  }
}

testReviews();
