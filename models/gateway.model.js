const mongoose = require('mongoose');
const Device = require('./device.model').schema;
const config = require('../config')

const gatewaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    IPv4Address: {
      type: String,
      required: true,
    },
    devices: []
  },
  { timestamps: true },
);

gatewaySchema.statics.deleteIfExists = async (id) => {
  const gateway = await Gateway.findOne({ _id: id })

  if (!gateway) {
    throw new Error('Record does not exist!')
  }

  try {
    await Gateway.deleteOne({ _id: id })
  } catch (e) {
    throw new Error(e)
  }
}

gatewaySchema.statics.addDevice = async (gatewayId, deviceId) => {
  const gateway = await Gateway.findOne({ _id: gatewayId })

  if (!gateway) {
    throw new Error('Gateway does not exist')
  }
  
  if(gateway.devices.indexOf(deviceId) !== -1) {
    throw new Error('Device already exist in this gateway') 
  }

  let currentGatewayDevices = [...gateway.devices, deviceId]

  if(currentGatewayDevices.length === config.GATEWAY_MAX_DEVICES_QUOTA) {
    throw new Error(`Gateway device quota reaced! No more than ${config.GATEWAY_MAX_DEVICES_QUOTA} are allowed!`)
  }

  try {
    gateway.devices = currentGatewayDevices
    await gateway.save();

  } catch (e) {
    return e;
  }

  return gateway;
}

const Gateway = mongoose.model('Gateway', gatewaySchema);

module.exports = Gateway