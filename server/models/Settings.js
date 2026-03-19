const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  autoApproveCompanies: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
