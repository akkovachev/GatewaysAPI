var express = require('express');
var router = express.Router();
const { body, param, validationResult } = require('express-validator');
const _ = require('lodash')

const Gateway = require('../models/gateway.model')

/**
 * @typedef Gateway
 * @property {string} name.required
 * @property {string} IPv4Address - IPv4 Address must be in approparite format
 * @property {object} devices - Array of devices
 */

 /**
 * @typedef GatewayResponse
 * @property {string} _id.required
 * @property {string} name.required
 * @property {string} IPv4Address - IPv4 Address must be in approparite format
 * @property {object} devices - Array of devices
 */

 /**
 * @typedef GatewayRequestBody
 * @property {string} gatewayId.required
 * @property {string} deviceId.required
 */

/**
 * Returns all the Gateways from the DB
 * @route GET /api/gateways
 * @group Gateway
 * @returns {GatewayResponse.model}  Returns gateways data
 */

router.get('/gateways', async (req, res) => {
    let gatewaysData;
    try {
        gatewaysData = await Gateway.find()
    } catch (e) {
        res.send({ error: e.toString() })
    }
    res.json(gatewaysData)
});

/**
 * Adds new Gateway to the DB
 * @route POST /gateway
 * @group Gateway
 * @param {Gateway.model} req.body.required
 * @returns {GatewayResponse.model}  Returns gateways data
 * 
 */
router.post('/gateway', body('IPv4Address').custom(ipv4Address => {
    let ipv4TestPattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/

    if (!ipv4TestPattern.test(ipv4Address)) {
        return Promise.reject("Ipv4 Address provided is incorrect")
    } else {
        return Promise.resolve('Success')
    }

}), async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let newGateway = new Gateway({
        name: req.body.name,
        IPv4Address: req.body.IPv4Address,
    })

    try {
        await newGateway.save()
        res.send(newGateway)
    } catch (e) {
        res.status(400).send(e.toString())
    }
});

/**
 * Adds a device to gateway
 * @route POST /gateway/device/add
 * @group Gateway
 * @param {GatewayRequestBody.model} req.body.required - Request Body
 * @returns {Gateway.model}  Returns gateways data
 */
router.post('/gateway/device/add', [
    body('gatewayId').exists(),
    body('deviceId').exists()], async (req, res) => {
        
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let addDevice = await Gateway.addDevice(req.body.gatewayId, req.body.deviceId)

        res.send(addDevice)
    } catch (e) {
        res.status(400).send({message: e.toString()})
    }
})

/**
 * Removes Gateway form DB
 * @route DELETE /gateway/:gatewayId
 * @group Gateway
 * @param {string} gatewayId.required
 * @param {string} deviceId.required
 * @returns {object}  Returns success / fail status
 */
router.delete('/gateway/:gatewayId', [
    param('gatewayId').isMongoId(),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        await Gateway.deleteIfExists(req.params.gatewayId);
        res.send({ result: "Delete Successfull" });
    } catch (e) {
        res.send({ error: e.toString() });
    }
})

/**
 * Delete device from gateway by id
 * @route DELETE /gateway/:gatewayId/remove/:deviceId/device
 * @group Gateway
 * @param {string} gatewayId.required
 * @param {string} deviceId.required
 * @returns {object}  Returns success / fail status
 */
router.delete('/gateway/:gatewayId/remove/:deviceId/device', [
    param('gatewayId').exists(),
    param('deviceId').exists()], async (req, res) => {
        
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let removeDevice =  await Gateway.updateOne({ _id: req.params.gatewayId}, { $pull: {"devices": req.params.deviceId} })

        console.log(removeDevice)
        res.send({result: 'success'})
    } catch (e) {
        res.status(400).send({error: e.toString()})
    }
})

module.exports = router;
