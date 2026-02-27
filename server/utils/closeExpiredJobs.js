// Utility to automatically close expired job postings
const Job = require('../models/Job');

/**
 * Close all jobs/internships where deadline has passed
 * @returns {Promise<number>} Number of jobs closed
 */
const closeExpiredJobs = async () => {
  try {
    const now = new Date();
    
    // Find all active jobs with deadline in the past
    const result = await Job.updateMany(
      {
        isActive: true,
        deadline: { $exists: true, $lt: now },
      },
      {
        isActive: false,
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Closed ${result.modifiedCount} expired job(s) automatically`);
    }

    return result.modifiedCount;
  } catch (error) {
    console.error('❌ Error closing expired jobs:', error.message);
    return 0;
  }
};

/**
 * Start periodic job expiration checker (runs every hour)
 */
const startJobExpirationChecker = () => {
  try {
    // Run immediately on startup
    closeExpiredJobs();

    // Run every hour (3600000 ms)
    setInterval(closeExpiredJobs, 60 * 60 * 1000);
    
    console.log('🕐 Job expiration checker started (runs every hour)');
  } catch (error) {
    console.error('❌ Failed to start job expiration checker:', error.message);
  }
};

module.exports = { closeExpiredJobs, startJobExpirationChecker };
