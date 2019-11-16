import fetch from "node-fetch"
import { URL } from "url"
import { Context } from "@azure/functions"
import { JobQueueMessage } from "userscope-data-models"
import TestResult from "../shared/TestResult"

export default async function(context: Context, message: JobQueueMessage) {
  context.log("Task master processing message from queue", message)

  if (!message.url) {
    context.log.error("Message does not include URL")
    throw new Error("Message does not include URL")
  }

  if (!message.testResultId) {
    context.log.error("Message does not include test result ID")
    throw new Error("Message does not include test result ID")
  }

  const { url, testResultId } = message
  const testResult = await TestResult.findById(testResultId)

  if (!testResult) {
    context.log.error(`Cannot find test result with ID ${testResultId}`)
    throw new Error(`Cannot find test result with ID ${testResultId}`)
  }

  let parsedUrl

  try {
    parsedUrl = new URL(url)
  } catch (err) {
    context.log.error("Unable to parse URL")
    throw err
  }

  try {
    const res = await fetch(parsedUrl, {
      timeout: 10000
    })

    if (res.status !== 200) {
      context.log.error(`URL returned status code ${res.status}`)
      throw new Error(`URL returned status code ${res.status}`)
    }
  } catch (err) {
    context.log.error("Could not fetch URL", err)
    throw err
  }

  context.log("Passing message to runners")

  context.bindings.bbcA11yJob = message
  context.bindings.lighthouseJob = message
}
