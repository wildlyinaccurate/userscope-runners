import { Context } from "@azure/functions"
import util from "util"
import childProcess from "child_process"
import { JobQueueMessage } from "userscope-data-models"
import TestResult from "../shared/TestResult"

const execFile = util.promisify(childProcess.execFile)

export default async function(context: Context, message: JobQueueMessage) {
  context.log("bbc-a11y-runner received message", message)

  const { url, testResultId } = message
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
