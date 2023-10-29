const router = require('express').Router()
const { sendMessage, allMessage } = require('../Controller/message');
const fetchUser = require('../Middleware/fetchUser');

router.route('/').post(fetchUser, sendMessage)
router.route('/:chatId').get(fetchUser, allMessage)

module.exports = router