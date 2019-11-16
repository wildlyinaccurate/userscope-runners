import mongoose from "mongoose"
import { Context } from "@azure/functions"
import TestResult from "./TestResult"
import util from "util"
import childProcess from "child_process"
import { JobQueueMessage } from "userscope-data-models"

const execFile = util.promisify(childProcess.execFile)

export default async function(context: Context, message: JobQueueMessage) {
  context.log("bbc-a11y-runner received message", message)

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
    .catch((err: Error) => {
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

  const bbcA11yResult = await execFile(bbcA11yPath, bbcA11yArgs).catch((error: { stdout: string; stderr: string }) => {
    // bbc-a11y exits with a non-zero status when issues are reported. The "error"
    // object we catch here contains stdout and stderr, so we can just return it
    // and handle it as a successful test run.
    return error
  })

  if (bbcA11yResult.stdout) {
    try {
      const results = JSON.parse(bbcA11yResult.stdout)

      context.log("bbc-a11y returned valid results")

      testResult.bbcA11yResults = {
        data: results
      }

      testResult.markModified("bbcA11yResults")

      await testResult.save()

      context.log("Successfully saved results to test result document")
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
