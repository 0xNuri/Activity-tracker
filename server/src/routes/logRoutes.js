const { Router } = require('express');
const router = Router();

const LogEntry = require('../models/LogEntry.js');
const { lookupPlace } = require('../utils/geocode');

router.get('/', async (req, res, next) => {
    try {
        const entries = await LogEntry.find();
        return res.status(200).json(entries);
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const logEntry = new LogEntry(req.body);

        // No place info (double-click or "My Location"): look it up from the coordinates
        if (!logEntry.placeId && logEntry.latitude != null && logEntry.longitude != null) {
            const place = await lookupPlace(logEntry.latitude, logEntry.longitude);
            if (place) logEntry.set(place);
        }

        const createdEntry = await logEntry.save();
        return res.status(201).json(createdEntry);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Some required fields are not filled out..'
            });
        }
        next(error);
    }
});

module.exports = router;