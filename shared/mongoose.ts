import mongoose from "mongoose"

const mongoUrl = process.env["COSMOSDB_CONNECTION_STRING"]

mongoose
  .connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
  .catch((err: Error) => {
    throw err
  })

export default mongoose
