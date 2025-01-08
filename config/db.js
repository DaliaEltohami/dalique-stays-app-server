const mongoose = require("mongoose");

const connectionsSring = "mongodb://127.0.0.1:27017/dalique-stays";

const db = () => {
  mongoose
    .connect(process.env.MONGO_URI || connectionsSring)
    .then(() => {
      console.log("MongoDB Connected Successfully");
    })
    .catch((err) => {
      console.log("Error", err);
    });
};

module.exports = db;
