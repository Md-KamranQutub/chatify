import mongoose from 'mongoose';
// import dns from 'dns'

const connectDB = async () => {
  try {
    // dns.setServers(['8.8.8.8', '8.8.4.4']); // Use Google Public DNS
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
