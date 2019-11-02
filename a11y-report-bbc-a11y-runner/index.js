const childProcess = require("child_process")

module.exports = async function(context, url) {
  context.log("bbc-a11y runner processing URL from queue", url)

  const bbcA11yPath = require.resolve("bbc-a11y")
  context.log("bbcA11yPath", bbcA11yPath)
  const bbcA11yArgs = ["--reporter", "json", url]
  context.log("bbcA11yArgs", bbcA11yArgs)
  const bbcA11yProcess = childProcess.spawn(bbcA11yPath, bbcA11yArgs)
  context.log("bbcA11yProcess", bbcA11yProcess)

  bbcA11yProcess.stderr.on("data", data => {
    context.log("(log) bbc-a11y failed)", data)
    context.log("(log toString) bbc-a11y failed)", data.toString("utf8"))
    context.log.error("bbc-a11y failed", data.toString("utf8"))
    context.log("Done after error")
    context.done()
  })

  bbcA11yProcess.stdout.on("data", data => {
    try {
      context.log("bbc-a11y returned valid JSON")
      context.binding.results = JSON.parse(data)
    } catch (e) {
      context.log("Ignoring non-JSON output", data)
      context.log("Ignoring non-JSON output toString", data.toString("utf8"))
      context.log.error("bbc-a11y returned invalid JSON", data.toString("utf8"))
      // Ignore non-JSON output
    }

    context.log("Done after stdout")
    context.done()
  })
}
