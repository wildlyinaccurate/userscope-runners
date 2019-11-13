import mongoose from "mongoose"
import { testResultSchema, TestResultDocument } from "userscope-data-models"

export default mongoose.model<TestResultDocument>("TestResult", testResultSchema)
