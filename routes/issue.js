const router = require('express').Router()
const { addIssue, getIssues, addSolution } = require('../controllers/issueContoller')
const ProtectedMode = require('../middleware/protectedMode')


router.route('/addissue').post(ProtectedMode, addIssue)
router.route('/getissue').post(ProtectedMode, getIssues)
router.route('/addsolution/:issueid').post(ProtectedMode, addSolution)

module.exports =  router