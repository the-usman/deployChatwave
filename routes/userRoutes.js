const { Login, CreateAccount, confirmCode, deleteAccountUnConfirmedAccount, SearchUser, upload, UploadImages, DeleteUser, UpdatedUser, getUser } = require('../controllers/usercontroller');
const ProtectedMode = require('../middleware/protectedMode');

const router = require('express').Router();

router.route('/login').post(Login);
router.route('/createuser').post(CreateAccount);
router.route('/confirm/:token1').get(confirmCode);
router.route('/delete').delete(ProtectedMode, DeleteUser);
router.route('/search').get(ProtectedMode, SearchUser);
router.route('/getuser').get(ProtectedMode, getUser);
router.route('/delete-unconfirmed-account').put(deleteAccountUnConfirmedAccount)
router.route('/upload').post(ProtectedMode, upload.single('file'), UploadImages )
router.route('/update').put(ProtectedMode, UpdatedUser)


module.exports = router;
