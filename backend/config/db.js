import mongoose from 'mongoose';

export async function connectMongo(uri) {
  if (!uri) {
    console.warn('MONGODB_URI missing: running without persistence.');
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.info('MongoDB connected.');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }
}
