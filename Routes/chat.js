const { AccessChat, FetchChats,createGroup, RenameGroup,AddGroup, RemoveGroup } = require('../Controller/chat');
const fetchUser = require('../Middleware/fetchUser');

const router = require('express').Router();


router.route('/').post(fetchUser, AccessChat )
router.route('/').get(fetchUser, FetchChats)
router.route('/group').post(fetchUser, createGroup )
router.route('/renamegroup').put(fetchUser, RenameGroup )
router.route('/addgroup').put(fetchUser, AddGroup )
router.route('/removegroup').put(fetchUser, RemoveGroup )

module.exports = router