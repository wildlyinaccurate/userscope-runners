const util = require("util")
const execFile = util.promisify(require("child_process").execFile)
const mongoose = require("mongoose")
const TestResult = require("./TestResult")

module.exports = async function(context, message) {
  context.log("bbc-a11y received message", message)

  if (!message.url) {
    context.log.error("Message does not include URL")
    throw new Error("Message does not include URL")
  }

  if (!message.testResultId) {
    context.log.error("Message does not include test result ID")
    throw new Error("Message does not include test result ID")
  }

  const { url, testResultId } = message

  const mongoUrl = process.env["COSMOSDB_CONNECTION_STRING"]

  await mongoose
    .connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
    .catch(err => {
      context.log.error("MongoDB connection error", err)
      throw err
    })

  const testResult = await TestResult.findById(testResultId)

  if (!testResult) {
    context.log.error(`Cannot find test result with ID ${testResultId}`)
    throw new Error(`Cannot find test result with ID ${testResultId}`)
  }

  const bbcA11yPath = require.resolve("bbc-a11y")
  const bbcA11yArgs = ["--reporter", "json", url]

  const bbcA11yResult = await execFile(bbcA11yPath, bbcA11yArgs).catch(error => {
    // bbc-a11y exits with a non-zero status when issues are reported. The "error"
    // object we catch here contains stdout and stderr, so we can just return it
    // and handle it as a successful test run.
    return error
  })

  if (bbcA11yResult.stdout) {
    try {
      // eslint-disable-next-line require-atomic-updates
      context.log("bbc-a11y returned valid results")

      testResult.bbcA11yResult = JSON.parse(bbcA11yResult.stdout)

      await testResult.save()
    } catch (err) {
      context.log.error("Could not save bbc-a11y results. Error:", err, "stdout:", bbcA11yResult.stdout)
      throw err
    }
  } else {
    context.log.error("bbc-a11y did not write to stdout")
  }

  if (bbcA11yResult.stderr) {
    context.log.error("bbc-a11y wrote to stderr", bbcA11yResult.stderr)
    throw new Error(bbcA11yResult.stderr)
  }
}
