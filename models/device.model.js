const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    vendor: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

deviceSchema.statics.deleteIfExists = async (id) => {
  const device = await Device.findOne({ _id: id })

  if (!device) {
    throw new Error('Record does not exist!')
  }

  try {
    await Device.deleteOne({ _id: id })
  } catch (e) {
    throw new Error(e)
  }
}

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device