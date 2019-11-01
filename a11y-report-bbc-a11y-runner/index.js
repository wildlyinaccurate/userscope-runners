const childProcess = require("child_process")

module.exports = async function(context, url) {
  context.log("bbc-a11y runner processing URL from queue", url)

  const bbcA11yPath = require.resolve("bbc-a11y")
  const bbcA11yArgs = ["--reporter", "json", url]
  const bbcA11yProcess = childProcess.spawn(bbcA11yPath, bbcA11yArgs)

  bbcA11yProcess.stderr.on("data", data => {
    context.log.error("bbc-a11y failed", data.toString("utf8"))
    context.done()
  })

  bbcA11yProcess.stdout.on("data", data => {
    try {
      context.log("bbc-a11y returned valid JSON")
      context.binding.results = JSON.parse(data)
    } catch (e) {
      context.log.error("bbc-a11y returned invalid JSON", data.toString("utf8"))
      // Ignore non-JSON output
    }

    context.done()
  })
}
