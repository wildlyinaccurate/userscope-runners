const mongoose = require("mongoose")
const bbcA11yResultSchema = require("./BbcA11yResult")

/**
 * TODO: This isn't the full TestResult schema. Ideally this project and the
 * web project should share types & schemas from a common package.
 */
const resultSchema = new mongoose.Schema({
  bbcA11yResults: bbcA11yResultSchema
})

module.exports = mongoose.model("TestResult", resultSchema)
