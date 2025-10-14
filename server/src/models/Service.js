const { Schema, model } = require("mongoose");

const serviceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    basePrice: { type: Number, required: true, min: 0 },
    durationMins: { type: Number, required: true, min: 1, max: 480 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = model("Service", serviceSchema);