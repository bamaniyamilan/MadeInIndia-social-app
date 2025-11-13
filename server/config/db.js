const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
  try {
    const uri = mongoUri || process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error('No MongoDB URI provided. Set MONGO_URI in .env or pass as parameter');
    }

    // Validate MongoDB URI format
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://');
    }

    const options = {
      // Modern Mongoose options (Mongoose 6+)
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
      // Optional: Add connection tuning for better performance
      maxPoolSize: 10, // Maximum number of sockets in the connection pool
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(uri, options);

    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔄 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

    return mongoose.connection;

  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    
    // Provide helpful suggestions based on common errors
    if (err.name === 'MongoNetworkError') {
      console.log('💡 Check if MongoDB is running and accessible');
    } else if (err.name === 'MongoParseError') {
      console.log('💡 Check your MongoDB URI format');
    } else if (err.name === 'MongoServerSelectionError') {
      console.log('💡 Check your network connection and MongoDB server status');
    }
    
    // Re-throw so caller can handle appropriately
    throw err;
  }
};

// Optional: Helper function to check connection status
connectDB.getConnectionStatus = () => {
  return mongoose.connection.readyState;
};

// Optional: Helper function to get connection stats
connectDB.getConnectionStats = () => {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    models: Object.keys(mongoose.connection.models),
  };
};

module.exports = connectDB;