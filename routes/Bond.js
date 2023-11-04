const { getBonds, AcceptBonds, RejectBonds, sendBonds, RemoveBond } = require('../controllers/bondController');
const ProtectedMode = require('../middleware/protectedMode');

const router = require('express').Router();

router.route('/getbonds').get(ProtectedMode, getBonds);
router.route('/acceptbond/:id').put(ProtectedMode, AcceptBonds)
router.route('/rejectbond/:id').put(ProtectedMode, RejectBonds)
router.route('/sentbond/:id').put(ProtectedMode, sendBonds)
router.route('/removebond/:id').put(ProtectedMode, RemoveBond)

module.exports = router