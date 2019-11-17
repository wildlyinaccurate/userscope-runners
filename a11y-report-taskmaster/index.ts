import fetch from "node-fetch"
import { URL } from "url"
import { Context } from "@azure/functions"
import { JobQueueMessage, TestResultDocument } from "userscope-data-models"
import TestResult from "../shared/TestResult"

export default async function(context: Context, message: JobQueueMessage) {
  context.log("Task master processing message from queue", message)

  const handleError = async (message: string, errorObj?: Error, testResult?: TestResultDocument) => {
    context.log.error(message)

    const error: Error = errorObj || new Error(message)

    if (testResult) {
      const source = context.bindingData.id
      const errorAlreadyLogged = testResult.testingErrors.some(e => e.source === source)

      if (!errorAlreadyLogged) {
        testResult.testingErrors.push({ source, message, error })
        await testResult.save()
      }
    }

    context.done(error)
  }

  if (!message.url) {
    await handleError("Message does not include URL")
  }

  if (!message.testResultId) {
    await handleError("Message does not include test result ID")
  }

  const { url, testResultId } = message
  const testResult = await TestResult.findById(testResultId)

  if (!testResult) {
    await handleError(`Cannot find test result with ID ${testResultId}`)
  }

  let parsedUrl

  try {
    parsedUrl = new URL(url)
  } catch (err) {
    await handleError("Unable to parse URL", err, testResult)
  }

  try {
    const res = await fetch(parsedUrl, {
      timeout: 10000
    })

    if (res.status !== 200) {
      await handleError(`URL returned status code ${res.status}`, undefined, testResult)
    }
  } catch (err) {
    await handleError(`Could not get response from ${url}`, err, testResult)
  }

  context.log("Passing message to runners")

  context.bindings.bbcA11yJob = message
  context.bindings.lighthouseJob = message
}
