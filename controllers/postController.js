const multer = require("multer");
const PostModel = require("../model/Post");
const Like = require("../model/Likes");
const User = require("../model/User");
const Comment = require("../model/Comment");
const path = require("path");
const fs = require('fs');
const dislike = require("../model/Dislike");
const mongoSanitize = require('mongo-sanitize')
const { ObjectId } = require('mongoose');



const thumbnail = multer.diskStorage({
    destination: async (req, file, cb) => {
        const baseDirectory = 'posts/';
        const postid = req.params.postid;
        const finalDirectory1 = path.join(baseDirectory, req.user.id);
        if (!fs.existsSync(finalDirectory1)) {
            fs.mkdirSync(finalDirectory1, { recursive: true }, (err) => {
                if (err) {
                    console.error('Error creating directory:', err);
                }
            });
        }
        const finalDirectory2 = path.join(finalDirectory1, postid);
        fs.mkdirSync(finalDirectory2, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating directory:', err);
            }
        });

        cb(null, finalDirectory2);
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        const filename = req.params.postid + '_thumbnail' + '.' + ext;
        cb(null, filename)
    }
})

const PostFiles = multer.diskStorage({
    destination: (req, file, cb) => {
        const postid = req.params.postid;
        cb(null, `posts/${req.user.id}/${postid}`)
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        const index = req.files.findIndex((uploadedFile) => uploadedFile.originalname === file.originalname);
        const timestamp = Date.now();
        const filename = `${timestamp}${index}.${ext}`;
        cb(null, filename)
    }
})

const UploadThumbnail = multer({
    storage: thumbnail
}).single('file')


const UploadPostFiles = multer({
    storage: PostFiles
}).array('files', 5)

async function updateDailyScore(postId, increment) {
    try {
        const currentDay = new Date().toISOString().split('T')[0].toString();
        const post = await PostModel.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        const dailyScore = post.score.find(score => score.date === currentDay);
        if (dailyScore) {
            dailyScore.score += increment;
        } else {
            const newScore = {
                date: currentDay,
                score: 0,
            };
            newScore.score = increment;
            post.score.push(newScore);
        }
        while (post.score.length > 7) {
            post.score.shift();
        }
        await post.save();
    } catch (error) {
        console.error(error.message);
    }
}
async function updateDailyLike(postId, increment) {
    try {
        const currentDay = new Date().toISOString().split('T')[0].toString();
        const post = await PostModel.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        const dailyScore = post.lastLikes.find(score => score.date === currentDay);
        if (dailyScore) {
            dailyScore.likes += increment;
        } else {
            const newScore = {
                date: currentDay,
                score: 0,
            };
            newScore.likes = increment;
            post.lastLikes.push(newScore);
        }
        while (post.lastLikes.length > 7) {
            post.score.shift();
        }
        await post.save();
    } catch (error) {
        console.error(error.message);
    }
}



const addPost = async (req, res) => {
    let success = false;
    try {
        const { caption, tag, isCompleted } = req.body;
        if (!caption || !tag) {
            return res.status(400).json({ success, error: "First fill all the input boxes" });
        }
        const tagList = JSON.parse(tag);

        const currentDay = new Date().toISOString().split('T')[0];
        let post = await PostModel.create({
            caption: caption,
            tags: tagList,
            isCompleted,
            user: req.user.id,
            score: [{ date: currentDay, score: 0 }]
        });
        await updateDailyScore(post.id, 5)
        post = await PostModel.findById(post.id).populate({
            path: "user",
            select: "pic name username"
        }).populate({
            path: "likes",
            populate: {
                path: "user",
                select: "pic name username"
            }
        })
            .populate({
                path: "dislike",
                populate: {
                    path: "user",
                    select: "pic name username"
                }
            })
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "pic name username"
                }
            })

        res.status(200).json({ success: true, post });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success, error: "Internal Server Error" });
    }
};

const addPostThumbnail = async (req, res) => {
    let success = false;
    try {
        const file = req.file;
        const postid = req.params.id;
        const { isComplete } = req.body;
        if (!file)
            return res.status(400).json({ success, error: "Please add some file" })
        let post = await PostModel.findById(postid);
        if (!post) {
            return res.status(400).json({ success, error: "No post exist" })
        }
        if (post.isCompleted)
            return res.status(401).json({ success, error: "Post already Completed" })
        if (post.user != req.user.id)
            return res.status(401).json({ success, error: "Unauthorized action" })
        post.thumbnail = file.filename;
        post.isCompleted = isComplete;
        await post.save();
        await updateDailyScore(post.id, 10)
        post = await PostModel.findById(post.id).populate({
            path: "user",
            select: "pic name username"
        }).populate({
            path: "likes",
            populate: {
                path: "user",
                select: "pic name username"
            }
        })
            .populate({
                path: "dislike",
                populate: {
                    path: "user",
                    select: "pic name username"
                }
            })
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "pic name username"
                }
            })
        return res.status(200).json({ success: true, post })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success, error: "Internal Server Error" })
    }
}


const AddPostFiles = async (req, res) => {
    let success = false;
    try {
        const files = req.files;
        const postid = req.params.id;
        const { isComplete } = req.body;
        if (!files)
            return res.status(400).json({ success, error: "Please add some file" })
        let post = await PostModel.findById(postid);
        if (!post) {
            return res.status(400).json({ success, error: "No post exist" })
        }
        if (post.isCompleted)
            return res.status(401).json({ success, error: "Post already Completed" })
        if (post.user != req.user.id)
            return res.status(401).json({ success, error: "Unauthorized action" })
        for (const file of files) {
            post.files.push(file.filename);
        }
        post.isCompleted = true;
        post = await PostModel.findById(post.id).populate({
            path: "user",
            select: "pic name username"
        }).populate({
            path: "likes",
            populate: {
                path: "user",
                select: "pic name username"
            }
        })
            .populate({
                path: "dislike",
                populate: {
                    path: "user",
                    select: "pic name username"
                }
            })
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "pic name username"
                }
            })
        return res.status(200).json({ success: true, post })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success, error: "Internal Server Error" })
    }
}


const likePost = async (req, res) => {
    let success = false;
    try {
        const postid = req.params.postid;
        const post = await PostModel.findById(postid)
        if (!post)
            return res.status(401).json({ success, error: "Post not found" })
        let like = await Like.findOne({ user: req.user.id, post: postid });
        if (like) {
            post.likes = post.likes.filter(likeid => likeid !== like.id)
            like = await Like.findByIdAndDelete(like.id);
            await updateDailyScore(postid, -10)

        }
        else {
            like = await Like.create({
                user: req.user.id,
                post: postid
            })
            await updateDailyScore(postid, 10)
            updateDailyLike(post.id, 1)
            post.likes.push(like)
        }
        await post.save();
        like = await like.populate({
            path: "user",
            select: "pic name username"
        })
        return res.status(200).json({ success: true, like })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success, error: "Internal Server Error" })
    }
}



const DislikePost = async (req, res) => {
    let success = false;
    try {
        const postid = req.params.postid;
        const post = await PostModel.findById(postid)
        if (!post)
            return res.status(401).json({ success, error: "Post not found" })
        let dislik = await dislike.findOne({ user: req.user.id, post: postid });
        if (dislik) {
            post.dislike = post.dislike.filter(likeid => likeid !== dislik.id)
            dislik = await dislike.findByIdAndDelete(dislik.id);
            await updateDailyScore(postid, 2)
            post.totalDislike -= 1
        }
        else {
            dislik = await dislike.create({
                user: req.user.id,
                post: postid
            })
            await updateDailyScore(postid, -2)
            post.dislike.push(dislik)
            post.totalDislike += 1
        }
        await post.save();
        dislik = await dislik.populate({
            path: "user",
            select: "pic name username"
        })
        return res.status(200).json({ success: true, dislike: dislik })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success, error: "Internal Server Error" })
    }
}

const GetSpecificUserPosts = async (req, res) => {
    let success = false;
    try {
        const id = req.user.id;
        console.log(id)
        let user = await User.findById(id);
        if (!user)
            return res.status(400).json({ success, error: "No User found" })
        const posts = await PostModel.find({ user: id }).populate({
            path: "user",
            select: "pic name username"
        }).populate({
            path: "likes",
            populate: {
                path: "user",
                select: "pic name username"
            }
        })
            .populate({
                path: "dislike",
                populate: {
                    path: "user",
                    select: "pic name username"
                }
            })
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "pic name username"
                }
            })
        res.status(200).json({ success: true, posts })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success, error: "Internal Server Error" })
    }
}

const getRandomPosts = (postsArray, count) => {
    const shuffled = postsArray.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}



const GetPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 5;

        const skip = (page - 1) * perPage;
        const postsForPage = await PostModel.find()
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(perPage)
            .populate({
                path: "user",
                select: "pic name username"
            }).populate({
                path: "likes",
                populate: {
                    path: "user",
                    select: "pic name username"
                }
            })
            .populate({
                path: "dislike",
                populate: {
                    path: "user",
                    select: "pic name username"
                }
            })
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "pic name username"
                }
            })

        if (postsForPage.length === 0) {
            return res.status(404).json({ success: false, error: "No more posts available." });
        }
        const randomPosts = getRandomPosts(postsForPage, 5);
        res.status(200).json({ success: true, data: randomPosts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};


const addComments = async (req, res) => {
    let success = false;
    try {
        const id = req.params.postid;
        const userId = req.user.id;
        const { content } = req.body;
        const user = await User.findById(userId)
        if (!user)
            res.status(401).json({ success, error: "User not exist" });
        const post = await PostModel.findById(id);
        if (!post)
            return res.status(401).json({ success, error: "Post is not Exists" })
        let comment = await Comment.create({
            content,
            user: userId,
            post: id
        })
        comment = await comment.populate({
            path: "user",
            select: "pic username name"
        })
        res.status(200).json({ success: true, comment })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success, error: "Internal Server Error" })
    }
}


const DeleteComment = async (req, res) => {
    let success = false;
    try {
        const commentId = req.params.commentid;
        console.log(commentId);
        const comment = await Comment.findOneAndDelete({ user: req.user.id, _id: commentId });
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(400).json({ error: "User not found", success })
        }
        if (!comment)
            return res.status(401).json({ success, error: "Comment Not Exists" })
        res.status(200).json({ success: true, comment })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success, error: 'Internal Server Error' })
    }
}

const getComments = async (req, res) => {
    let success = false;
    try {
        const { postid } = req.params;
        const post = await PostModel.findById(postid);
        if (!post)
            return res.status(401).json({ success, error: "Post Not Found" })
        const comment = await Comment.find({ post: postid }).sort({
            updatedAt: -1
        }).populate({
            path: "user",
            select: "pic username name"
        })
        return res.status(200).json({ success: true, comment })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success, error: 'Internal Server Error' })
    }
}



const DeletePost = async (req, res) => {
    let success = false;
    try {
        const postid = req.params.postid;
        console.log(postid)
        let post = await PostModel.findOne({ user: req.user.id, _id: postid });
        if (!post) {
            return res.status(401).json({ success, error: "Post not Found" });
        }
        const filePath = `posts/${req.user.id}/${postid}`;

        if (fs.existsSync(filePath)) {
            fs.readdirSync(filePath).forEach((file) => {
                const curPath = path.join(filePath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(filePath);
        }
        post = await PostModel.findByIdAndDelete(post.id);
        res.status(200).json({ success: true, post })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success, error: "Internal Server Error" })
    }
}


const CompletedPost = async (req, res) => {
    let success = false;
    try {
        const postid = req.params.postid;
        let post = await PostModel.findOne({_id: postid, user:req.user.id});
        if (!post) {
            return res.status(400).json({ error: "No project found", success })
        }
        post.isCompleted = true;
        await post.save();
        post = await PostModel.findById(postid).populate({
            path: "user",
            select: "pic name username"
        }).populate({
            path: "likes",
            populate: {
                path: "user",
                select: "pic name username"
            }
        })
            .populate({
                path: "dislike",
                populate: {
                    path: "user",
                    select: "pic name username"
                }
            })
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "pic name username"
                }
            });
        return res.status(200).json({ post, success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error", success })
    }
}
const SearchPost = async (req, res) => {
    let success = false;
    try {
        const search = req.query.search;
        const sanitizedSearch = mongoSanitize(search);
        console.log("Original search:", search);
        console.log("Sanitized search:", sanitizedSearch);

        const posts = await PostModel.find({
            $and: [
                {
                    isCompleted: true,
                },
                {
                    $or: [
                        { tags: { $elemMatch: { $regex: new RegExp(sanitizedSearch, "i") } } },
                        { caption: { $regex: new RegExp(sanitizedSearch, "i") } },
                    ],
                },
            ]
        }).populate({
            path: "user",
            select: "pic name username"
        }).populate({
            path: "likes",
            populate: {
                path: "user",
                select: "pic name username"
            }
        })
            .populate({
                path: "dislike",
                populate: {
                    path: "user",
                    select: "pic name username"
                }
            })
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "pic name username"
                }
            });
        console.log("Search results:", posts);
        return res.status(200).json({ success: true, posts });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}





module.exports = {
    addPost,
    addPostThumbnail,
    UploadThumbnail,
    UploadPostFiles,
    AddPostFiles,
    likePost,
    GetSpecificUserPosts,
    GetPosts,
    DislikePost,
    addComments,
    DeleteComment,
    getComments,
    SearchPost,
    DeletePost,
    CompletedPost
}