import { Schema, models, model } from "mongoose";

// Foto disimpan di koleksi terpisah (bukan di dalam dokumen Task) supaya
// list task tetap ringan dan tidak mendekati batas 16 MB per dokumen.
const ImageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    contentType: { type: String, required: true, enum: ["image/jpeg"] },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export default models.Image || model("Image", ImageSchema);