const mongoose = require("mongoose")
const Mixed = mongoose.Schema.Types.Mixed

const bbcA11yResultSchema = new mongoose.Schema(
  {
    data: Mixed
  },
  { timestamps: true }
)

module.exports = bbcA11yResultSchema
