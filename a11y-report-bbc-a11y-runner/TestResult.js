const mongoose = require("mongoose")
const { testResultSchema } = require("userscope-data-models")

module.exports = mongoose.model("TestResult", testResultSchema)
