import mongoose from "mongoose"

const resumeSchema = new mongoose.Schema({


},{Timestamps:true}) 

const resume =  mongoose.model("Resume", resumeSchema);

export default resume;