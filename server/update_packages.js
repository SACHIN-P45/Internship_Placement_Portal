const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/internship_placement_portal')
    .then(async () => {
        const db = mongoose.connection.db;
        const allJobs = await db.collection('jobs').find().toArray();
        for (let job of allJobs) {
            let text = (job.salary || '').toLowerCase();
            let match = text.match(/\d+/g);
            if (match) {
                let num = parseFloat(match.join(''));
                let packageLPA = 0;
                if (num > 0) {
                    if (text.includes('month')) {
                        packageLPA = (num * 12) / 100000;
                    } else {
                        packageLPA = num / 100000;
                    }
                }
                await db.collection('jobs').updateOne({ _id: job._id }, { $set: { package: packageLPA } });
                console.log('Updated ' + job.title + ' to ' + packageLPA + ' LPA');
            }
        }
        console.log('Update Complete.');
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
