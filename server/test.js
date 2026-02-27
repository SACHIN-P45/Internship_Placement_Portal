const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/internship_placement_portal").then(async () => {
    const db = mongoose.connection.db;
    const jobs = await db.collection("jobs").find({}).toArray();
    console.log(JSON.stringify(jobs, null, 2));
    process.exit(0);
});
