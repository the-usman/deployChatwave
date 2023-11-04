const router = require('express').Router();
const { addPost, addPostThumbnail, UploadThumbnail, UploadPostFiles, AddPostFiles, likePost, GetSpecificUserPosts, GetPosts, DislikePost, addComments, DeleteComment, getComments, SearchPost, DeletePost, CompletedPost } = require('../controllers/postController');
const ProtectedMode = require('../middleware/protectedMode')

router.route('/addpost').post(ProtectedMode, addPost);  // Checked
router.route('/addthumbnail/:postid').post(ProtectedMode, UploadThumbnail, addPostThumbnail);  // Checked
router.route('/addpostfiles/:postid').post(ProtectedMode, UploadPostFiles, AddPostFiles); //Checked
router.route('/likepost/:postid').post(ProtectedMode, likePost); // Cheaked
router.route('/dislike/:postid').post(ProtectedMode, DislikePost); //Checked
router.route('/addcomment/:postid').post(ProtectedMode, addComments); // Checked
router.route('/deletecomment/:commentid').post(ProtectedMode, DeleteComment); // Checked
router.route('/getposts').get(ProtectedMode, GetSpecificUserPosts); // Checked
router.route('/getposts').get(ProtectedMode, GetPosts);  // Checked
router.route('/getcomment/:postid').get(ProtectedMode, getComments);  // Checked
router.route('/search').get(ProtectedMode, SearchPost);    // Checked
router.route('/deletepost/:postid').post(ProtectedMode, DeletePost) // Checked
router.route('/complete/:postid').post(ProtectedMode, CompletedPost) // checked


module.exports = router