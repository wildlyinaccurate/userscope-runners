const util = require("util")
const execFile = util.promisify(require("child_process").execFile)
const mongoose = require("mongoose")
const Result = require("./result")

module.exports = async function(context, url) {
  context.log("bbc-a11y runner processing URL from queue", url)

  const mongoUrl = process.env["COSMOSDB_CONNECTION_STRING"]

  await mongoose
    .connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
    .catch(err => {
      context.log.error("MongoDB connection error", err)
      throw err
    })

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

      const result = new Result({
        url: url,
        data: JSON.parse(bbcA11yResult.stdout)
      })

      await result.save()
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
