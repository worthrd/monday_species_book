const router = require('express').Router();
const { authenticationMiddleware } = require('../middlewares/authentication');
const mondayController = require('../controllers/monday-controller');

router.post('/monday/execute_action', authenticationMiddleware, mondayController.executeAction);
router.post('/monday/save_species', authenticationMiddleware, mondayController.save_species);

module.exports = router;
