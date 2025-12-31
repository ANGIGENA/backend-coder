import mongoose from 'mongoose';


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nico:1234@cluster0.tjcmcww.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB conectado exitosamente');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};