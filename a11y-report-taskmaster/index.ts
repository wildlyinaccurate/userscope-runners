import { Context } from "@azure/functions"
import { JobQueueMessage } from "userscope-data-models"

export default async function(context: Context, message: JobQueueMessage) {
  context.log("Task master processing message from queue", message)

  context.bindings.bbcA11yJob = message
  context.bindings.lighthouseJob = message
}
