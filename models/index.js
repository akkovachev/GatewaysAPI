var mongoose = require('mongoose');
 
const DATABASE_URL="mongodb+srv://musala:yNHEBEj02DypGCcx@kidskitchen-dx0dr.mongodb.net/Gateway?retryWrites=true&w=majority"

const connectDb = () => {
  return mongoose.connect(DATABASE_URL, { useUnifiedTopology: true, useNewUrlParser: true });
};
 
module.exports = connectDb
