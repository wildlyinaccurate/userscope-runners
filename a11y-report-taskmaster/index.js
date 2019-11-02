module.exports = async function(context, url) {
  context.log("Task master processing URL from queue", url)

  context.bindings.bbcA11yJob = url
}
