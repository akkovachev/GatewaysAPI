var express = require('express');
var router = express.Router();
const { param, validationResult } = require('express-validator');
const _ = require('lodash')

const Device = require('../models/device.model')

/**
 * @typedef Device
 * @property {string} vendor.required
 * @property {string} status.required
 */

/**
 * @typedef DeviceResponse
 * @property {string} _id.required
 * @property {string} vendor.required
 * @property {string} status.required
 */

/**
 * Returns all the devices from the DB
 * @route GET /api/devices
 * @group Device
 * @returns {DeviceResponse.model}  Returns devices data
 */
router.get('/devices', async (req, res) => {
    let devicesData;
    try {
        devicesData = await Device.find()
    } catch (e) {
        res.send({ error: e.toString() })
    }
    res.json(devicesData)
});

/**
 * Adds new Device to the DB
 * @route POST /api/device
 * @group Device
 * @param {Device.model} req.body.required
 * @returns {DeviceResponse.model}  Returns device data
 * 
 */
router.post('/device', async (req, res) => {

    let newDevice = new Device({
        vendor: req.body.vendor,
        status: req.body.status
    })

    try {
        await newDevice.save()
        res.send(newDevice)
    } catch (e) {
        res.status(400).send(e)
    }
});

/**
 * Removes Device form DB
 * @route DELETE /api/device/:deviceId
 * @group Device
 * @param {string} deviceId.required
 * @returns {object}  Returns success / fail status
 */
router.delete('/device/:deviceId', [
    param('deviceId').isMongoId(),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        await Device.deleteIfExists(req.params.deviceId);
        res.send({ result: "Delete Successfull" });
    } catch (e) {
        res.send({ error: e.toString() });
    }
})

module.exports = router;
