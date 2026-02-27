require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal')
    .then(async () => {
        const db = mongoose.connection.db;

        // Fix all Jobs
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
                if (job.package !== packageLPA) {
                    await db.collection('jobs').updateOne({ _id: job._id }, { $set: { package: packageLPA } });
                    console.log('Fixed job ' + job.title + ' to ' + packageLPA + ' LPA');
                }
            }
        }

        // Fix all Applications
        const allApps = await db.collection('applications').find({ status: 'selected' }).toArray();
        for (let app of allApps) {
            const job = allJobs.find(j => j._id.toString() === app.job.toString());
            if (job) {
                let properLPA = 0;
                let text = (job.salary || '').toLowerCase();
                let match = text.match(/\d+/g);
                if (match) {
                    let num = parseFloat(match.join(''));
                    if (num > 0) {
                        properLPA = text.includes('month') ? (num * 12) / 100000 : num / 100000;
                    }
                }
                if (app.selectedPackage !== properLPA) {
                    await db.collection('applications').updateOne({ _id: app._id }, { $set: { selectedPackage: properLPA } });
                    console.log('Fixed application for ' + job.title + ' to ' + properLPA + ' LPA');
                }
            }
        }

        console.log('Fix complete on actual DB.');
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
