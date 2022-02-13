const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_DB_URL,(err)=>{
    if (err) console.log("error in connection database");
   console.log("connect to database successfully");
});