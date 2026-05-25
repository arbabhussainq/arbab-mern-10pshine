require("dotenv").config();
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://localhost:27017/notesapp_test";
process.env.LOG_LEVEL = "silent";
