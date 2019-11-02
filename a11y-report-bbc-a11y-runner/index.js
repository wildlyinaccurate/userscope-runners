const util = require("util")
const execFile = util.promisify(require("child_process").execFile)

module.exports = async function(context, url) {
  context.log("bbc-a11y runner processing URL from queue", url)

  const bbcA11yPath = require.resolve("bbc-a11y")
  const bbcA11yArgs = ["--reporter", "json", url]

  const { stdout, stderr } = await execFile(bbcA11yPath, bbcA11yArgs)

  if (stdout) {
    try {
      // eslint-disable-next-line require-atomic-updates
      context.binding.results = JSON.parse(stdout)
    } catch (e) {
      context.log.error("bbc-a11y returned invalid JSON", stdout)
    }
  } else {
    context.log.error("bbc-a11y did not write to stdout")
  }

  if (stderr) {
    context.log.error("bbc-a11y wrote to stderr", stderr)
  }
}
