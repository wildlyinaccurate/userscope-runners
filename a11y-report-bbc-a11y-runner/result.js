const mongoose = require("mongoose")
const Mixed = mongoose.Schema.Types.Mixed

const resultSchema = new mongoose.Schema(
  {
    data: Mixed
  },
  { timestamps: true }
)

module.exports = mongoose.model("bbc-a11y-result", resultSchema)
