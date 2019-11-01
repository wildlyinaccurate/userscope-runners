const childProcess = require("child_process")

module.exports = async function(context, url) {
  context.log("bbc-a11y runner processing URL from queue", url)

  const bbcA11yPath = require.resolve("bbc-a11y")
  const bbcA11yArgs = ["--reporter", "json", url]
  const bbcA11yProcess = childProcess.spawn(bbcA11yPath, bbcA11yArgs)

  bbcA11yProcess.stderr.on("data", data => {
    context.error("[bbc-a11y error]", data.toString("utf8"))
  })

  bbcA11yProcess.stdout.on("data", data => {
    try {
      context.binding.results = JSON.parse(data)
    } catch (e) {
      // Ignore non-JSON output
    }

    context.done()
  })
}
