const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/internship_placement_portal").then(async () => {
    const db = mongoose.connection.db;
    const apps = await db.collection("applications").aggregate([
        { $match: { status: "selected" } },
        {
            $lookup: {
                from: "jobs",
                localField: "job",
                foreignField: "_id",
                as: "jobData",
            }
        },
        { $unwind: { path: "$jobData", preserveNullAndEmptyArrays: true } },
        {
            $addFields: {
                parsedPackage: {
                    $convert: {
                        input: {
                            $ifNull: [
                                {
                                    $reduce: {
                                        input: {
                                            $regexFindAll: {
                                                input: { $ifNull: ['$jobData.salary', '0'] },
                                                regex: "[0-9]+"
                                            }
                                        },
                                        initialValue: "",
                                        in: { $concat: ["$$value", "$$this.match"] }
                                    }
                                },
                                "0"
                            ]
                        },
                        to: "double",
                        onError: 0,
                        onNull: 0
                    }
                }
            }
        },
        {
            $addFields: {
                finalPackageLPA: {
                    $cond: [
                        { $gt: ['$parsedPackage', 0] },
                        {
                            $divide: [
                                {
                                    $cond: [
                                        { $regexMatch: { input: { $toLower: { $ifNull: ['$jobData.salary', ''] } }, regex: 'month' } },
                                        { $multiply: ['$parsedPackage', 12] },
                                        '$parsedPackage'
                                    ]
                                },
                                100000]
                        },
                        0
                    ]
                }
            }
        },
        { $project: { _id: 1, salaryString: "$jobData.salary", parsedPackage: 1, finalPackageLPA: 1 } }
    ]).toArray();
    console.log(JSON.stringify(apps, null, 2));
    process.exit(0);
});
