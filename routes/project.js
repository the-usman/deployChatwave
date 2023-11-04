const { AddProject, DeleteProject, updatedProject, AddFiles, deleteFiles, AddContributors, GetSpecificUserProjects, SearchProjects, AddThumbnail, UploadThumbnail, uploadFiles, GetAllProject, AddLike, AddTags, addComment, getComments, DeleteComment, CompleteProject } = require('../controllers/projectController');
const ProtectedMode = require('../middleware/protectedMode');

const router = require('express').Router();


router.route('/addproject').post(ProtectedMode, AddProject) // Checked
router.route('/deleteproject/:projectid').post(ProtectedMode, DeleteProject)  // Checked
router.route('/addthumbnail/:projectid').post(ProtectedMode,UploadThumbnail, AddThumbnail)  // Checked
router.route('/addfiles/:projectid').post(ProtectedMode, uploadFiles, AddFiles)  // Checked
router.route('/deletefile/:projectid').post(ProtectedMode, deleteFiles)   // Checked
router.route('/updateproject/:projectid').post(ProtectedMode, updatedProject) // Checked
router.route('/like/:projectid').post(ProtectedMode, AddLike) // Check 
router.route('/addcontributer/:projectid').post(ProtectedMode, AddContributors)  // Checked
router.route('/getuserprojects').get(ProtectedMode, GetSpecificUserProjects)  // Checked
router.route('/getprojects').get(ProtectedMode, GetAllProject) // Checked
router.route('/searchproject').get(ProtectedMode, SearchProjects)  // Cheaked
router.route('/addtags/:projectid').post(ProtectedMode, AddTags)   // Checked
router.route('/addcomment/:projectid').post(ProtectedMode, addComment) // Checked
router.route('/getcomment/:projectid').get(ProtectedMode, getComments) // Checked
router.route('/deletecomment/:commentid').get(ProtectedMode, DeleteComment) // checked
router.route('/complete/:projectid').post(ProtectedMode, CompleteProject) // Checked


module.exports = router;