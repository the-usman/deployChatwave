const path = require('path')
const fs = require('fs')
const User = require("../model/User");
const Like = require("../model/Likes");
const Comment = require("../model/Comment");
const Project = require("../model/Project");
const mongoSanitize = require("mongo-sanitize");

const multer = require("multer");
const { ObjectId } = require("mongodb");

const thumbnail = multer.diskStorage({
  destination: async (req, file, cb) => {
    const baseDirectory = "projects/";
    const projectid = req.params.projectid;
    const finalDirectory1 = path.join(baseDirectory, req.user.id);
    if (!fs.existsSync(finalDirectory1)) {
      fs.mkdirSync(finalDirectory1, { recursive: true }, (err) => {
        if (err) {
          console.error("Error creating directory:", err);
        }
      });
    }
    const finalDirectory2 = path.join(finalDirectory1, projectid);
    console.log(finalDirectory2)
    fs.mkdirSync(finalDirectory2, { recursive: true }, (err) => {
      if (err) {
        console.error("Error creating directory:", err);
      }
    });

    cb(null, finalDirectory2);
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    const filename = req.params.projectid + "_thumbnail" + "." + ext;
    cb(null, filename);
  },
});

const UploadThumbnail = multer({
  storage: thumbnail,
}).single("file");

const AddProjectFiles = multer.diskStorage({
  destination: (req, file, cb) => {
    const directory = `projects/${req.user.id}/${req.params.projectid}`;
    cb(null, directory);
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    const timestamp = Date.now();
    filename = `${timestamp}.${ext}`;
    cb(null, filename);
  },
});

const uploadFiles = multer({
  storage: AddProjectFiles,
}).array("files", 5);

async function updateDailyScore(projectid, increment) {
  try {
    const currentDay = new Date().toISOString().split("T")[0].toString();
    const post = await Project.findById(projectid);
    if (!post) {
      throw new Error("Post not found");
    }
    const dailyScore = post.score.find((score) => score.date === currentDay);
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
async function updateDailyLike(projectid, increment) {
  try {
    const currentDay = new Date().toISOString().split("T")[0].toString();
    const post = await Project.findById(projectid);
    if (!post) {
      throw new Error("Post not found");
    }

    const dailyScore = post.lastLikes.find(
      (score) => score.date === currentDay
    );
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

const AddProject = async (req, res) => {
  let success = false;
  try {
    const { name, data, isCompleted, caption  } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ success, error: "Unauthorized Action" });
    }
    const dataList = data;

    let project = await Project.create({
      user: req.user.id,
      name: name,
      data: dataList,
      isCompleted: isCompleted,
      caption: caption
    });

    await updateDailyScore(project.id, 5);
    project = await ReturnProject(project.id);

    res.status(200).json({ success: true, project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success, error: "Internal Server Error" });
  }
};



const updatedProject = async (req, res) => {
  let success = false;
  try {
    const projectid = req.params.projectid;
    const project = await Project.findById(projectid);
    const userId = req.user.id;
    if (!project) {
      return res.status(400).json({ success, error: "Project not found" });
    }
    if (!project.user.equals(new ObjectId(userId))) {
      return res.status(401).json({ success, error: "Unauthrized Actio" });
    }
    const { name, data, caption } = req.body;
    const updatedObject = {};
    if (name) {
      updatedObject.name = name;
    }
    if (data) {
      const dataList = JSON.parse(data);
      updatedObject.data = dataList;
    }
    if (caption) {
      updatedObject.caption = caption
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectid,
      { $set: updatedObject },
      { new: true }
    );
    const project2 = await ReturnProject(updatedProject.id);
    res.status(200).json({ success: true, project: project2 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success, error: "Internal Server Error" });
  }
};

const deleteFiles = async (req, res) => {
  let success = false;
  try {
    const projectid = req.params.projectid;
    const filename = req.body.name;
    let project = await Project.findOne({ _id: projectid, user: req.user.id })
    if (!project) {
      return res.status(400).json({ success, "error": "Project not found" })
    }
    project.files = project.files.filter(fileList => fileList != filename);
    const filePath = `C:\\Users\\lenovo\\Desktop\\ShareHive\\back-end\\projects\\${req.user.id}\\${projectid}/${project.files[0]}`
    console.log()
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${err}`);
      } else {
        console.log(`File ${filePath} has been successfully deleted`);
      }
    })
    await project.save();
    project = await ReturnProject(project)
    res.status(200).json({ success: true, project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success, error: "Internal Server Error" });
  }
};

const ReturnProject = async (projectid) => {
  const project = await Project.findById(projectid)
    .populate({
      path: "user contributors",
      select: "pic name username",
    })
    .populate({
      path: "likes",
      populate: {
        path: "user",
        select: "pic name username",
      }
    })
    .populate({
      path: "comment",
      populate: {
        path: "user",
        select: "pic name username",
      }
    });

  return project;
};


const AddContributors = async (req, res) => {
  let success = false;
  try {
    const { users, isCompleted } = req.body;
    const projectid = req.params.projectid;
    const userId = req.user.id;
    if (!users) {
      return res.status(400).json({ success, error: "Invalid Request" });
    }
    let project = await Project.findById(projectid);
    if (!project) {
      return res.status(400).json({ success, error: "Project not found" });
    }
    if (!project.user.equals(new ObjectId(userId))) {
      return res.status(401).json({ success, error: "Unauthrized Action" });
    }
    const userList = JSON.parse(users);
    for (const user of userList) {
      if (!project.contributors.includes(user))
        project.contributors.push(user);
    }
    project.isCompleted = isCompleted;
    await project.save();
    project = await ReturnProject(projectid);
    res.status(200).json({ success: true, project: project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success, error: "Internal Server Error" });
  }
};

const AddThumbnail = async (req, res) => {
  let success = false;
  try {
    const file = req.file;
    const isCompleted = req.body.isCompleted;
    const projectid = req.params.projectid;
    const userId = req.user.id;
    if (!file) {
      return res.status(400).json({ success, error: "Files Not Found" });
    }
    let project = await Project.findById(projectid);
    if (!project) {
      return res.status(400).json({ success, error: "Project not found" });
    }
    if (!project.user.equals(new ObjectId(userId))) {
      return res.status(401).json({ success, error: "Unauthrized Action" });
    }
    project.thumbnail = file.filename;
    project.isCompleted = isCompleted;
    await project.save();
    project = await ReturnProject(projectid);
    res.status(200).json({ success: true, project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success, error: "Internal Server Error" });
  }
};


const GetSpecificUserProjects = async (req, res) => {
  let success = false;
  try {
    const userId = req.user.id;
    const projects = await Project.find({ user: userId })
      .sort({ updatedAt: -1 })
      .populate({
        path: "user contributors",
        select: "pic name username",
      })
      .populate({
        path: "likes",
        populate: {
          path: "user",
          select: "pic name username"
        } 
      })
      .populate({
        path: "comment",
        populate: {
          path: "user",
          select: "pic name username"
        } 
      })

    return res.status(200).json({ success: true, projects });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


const CompleteProject = async (req, res) => {
  let success = false;
  try {
    const projectid = req.params.projectid;
    let project = await Project.findById(projectid);
    if (!project) {
      return res.status(400).json({error : "No project found", success})
    }
    if (!project.user.equals(new ObjectId(req.user.id))) {
      return res.status(401).json({error: "Unauthorized Action", success})
    }
    project.isCompleted = true;
    await project.save();
    project = await ReturnProject(projectid);
    return res.status(200).json({ project, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({error: "Internal Server Error", success})
  }
}

const SearchProjects = async (req, res) => {
  let success = false;
  try {
    const search = mongoSanitize(req.query.search);
    console.log("Search term:", search);
    const projects = await Project.find({
      $and: [
        {
          isCompleted: true,
        },
        {
          $or: [
            { tags: { $elemMatch: { $regex: new RegExp(search, "i") } } },
            { name: { $regex: new RegExp(search, "i") } },
          ],
        },
      ],
    }).populate({
      path: "user contributors",
      select: "pic name username",
    })
    .populate({
      path: "likes",
      populate: {
        path: "user",
        select: "pic name username"
      } 
    })
    .populate({
      path: "comment",
      populate: {
        path: "user",
        select: "pic name username"
      } 
    });
    
    console.log("Projects found:", projects);
    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success, error: "Internal Server Error" });
  }
};



const AddTags = async (req, res) => {
  let success = false;
  try {
    const tags = req.body.tags;
    const { isCompleted } = req.body;
    const projectid = req.params.projectid;
    const userId = req.user.id;
    console.log(new ObjectId(userId))
    if (!tags) {
      return res.status(400).json({ success, error: "Files Not Found" });
    }
    let project = await Project.findById(projectid);
    if (!project) {
      return res.status(400).json({ success, error: "Project not found" });
    }
    if (!project.user.equals(new ObjectId(userId))) {
      return res.status(401).json({ success, error: "Unauthrized Action" });
    }
    const tagList = JSON.parse(tags);
    project.tags = tagList;
    project.isCompleted = isCompleted;
    await project.save();
    project = await ReturnProject(projectid);
    return res.status(200).json({ success: true, project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success, error: "Internal Server Error" });
  }
};



const AddFiles = async (req, res) => {
  let success = false;
  try {
    const files = req.files;
    const isCompleted = req.body.isCompleted;
    const projectid = req.params.projectid;

    const userId = req.user.id;
    if (!files) {
      return res.status(400).json({ success, error: "Files Not Found" });
    }
    let project = await Project.findById(projectid);
    if (!project) {
      return res.status(400).json({ success, error: "Project not found" });
    }
    if (!project.user.equals(new ObjectId(userId))) {
      return res.status(401).json({ success, error: "Unauthrized Action" });
    }
    for (const file of files) {
      console.log(file.filename)
      project.files.push(file.filename);
      await updateDailyScore(project.id, 2);
    }
    project.isCompleted = isCompleted;
    await project.save();
    project = await ReturnProject(projectid);
    res.status(200).json({ success: true, project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success, error: "Internal Server Error" });
  }
};


const DeleteProject = async (req, res) => {
  let success = false;
  try {
    const projectid = req.params.projectid;
    const userId = req.user.id;
    let project = await Project.findOne({ _id: projectid, user: userId })
    if (!project) {
      return res.status(401).json({ success, error: "Project not found" });
    }
    console.log(project.thumbnail)
    let filePath = `projects/${userId}/${projectid}`


    if (fs.existsSync(filePath)) {
      fs.readdirSync(filePath).forEach((file) => {
        const curPath = path.join(filePath, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(filePath); // Delete the folder itself
    }
    project = await Project.findOneAndDelete(project.id);
    res.status(200).json({ success: true, id: projectid })
  } catch (error) {
    console.log(error);
    res.status(500).json({ success, error: "Internal Server Error" })
  }
}

const AddLike = async (req, res) => {
  let success = false;
  try {
    const projectid = req.params.projectid;
    const project = await Project.findById(projectid)
    if (!project)
      return res.status(401).json({ success, error: "Project not found" })
    let like = await Like.findOne({ user: req.user.id, project: projectid });
    if (like) {
      project.likes = project.likes.filter(likeid => likeid !== like.id)
      like = await Like.findByIdAndDelete(like.id);
      await updateDailyScore(projectid, -10)

    }
    else {
      like = await Like.create({
        user: req.user.id,
        post: projectid
      })
      await updateDailyScore(projectid, 10)
      updateDailyLike(project.id, 1)
      project.likes.push(like)
    }
    await project.save();
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

const shuffleProject = (projectArr) => {
  return projectArr.sort(() => 0.5 * Math.random())
}

const GetAllProject = async (req, res) => {
  let success = false;
  try {
    const page = req.params.page;
    const responseSize = req.body.pageSize || 5
    const jump = (page - 1) * responseSize;
    const projects = await Project.find()
      .sort({
        updatedAt: -1
      })
      .skip(jump)
      .limit(responseSize)
      .populate({
        path: "user contributors",
        select: "pic name username",
      })
      .populate({
        path: "likes",
        populate: {
          path: "user",
          select: "pic name username"
        } 
      })
      .populate({
        path: "comment",
        populate: {
          path: "user",
          select: "pic name username"
        } 
      })

    const shuffledProjects = shuffleProject(projects)
    return res.status(200).json({ success: true, projects: shuffledProjects })

  } catch (error) {
    console.log(error);
    res.status(500).json({ success, error: "Internal Server Error" })
  }
}

const addComment = async (req, res) => {
  let success = false;
  try {
    const content = req.body.content
    const projectid = req.params.projectid;
    const user = await User.findById(req.user.id);
    let project = await Project.findById(projectid);
    if (!user || !project || !content) {
      return res.status(401).json({ error: "Unauthrized Action" })
    }
    let comment = await Comment.create({
      content,
      user: req.user.id,
      project: projectid
    })
    comment = comment.populate({
      path: "user",
      select: "pic name username"
    })
    project.comment = comment.id;
    await project.save();
    return res.status(200).json({ comment, success: true })
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", success })
  }
}


const getComments = async (req, res) => {
  let success = false;
  try {
    const projectid = req.params.projectid;
    const project = await Project.findById(projectid);
    if (!project) {
      return res.status(400).json({ error: "No Project Found", success })
    }
    const comments = await Comment.find({
      project: projectid
    }).populate({
      path: "user",
      select: "pic name username"
    })
      .sort({
        updatedAt: -1
      })
    return res.status(200).json({ comments, success: true })
  } catch (error) {
    console.lof(error);
    res.status(500).json({ error: "Internal Server Error" })
  }
}


const DeleteComment = async (req, res) => {
  let success = false;
  try {
    const commentId = req.params.commentid;
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(400).json({ error: "User not found", success })
    }
    const comment = await Comment.findOneAndDelete({ user: req.user.id, _id: commentId });

    if (!comment)
      return res.status(401).json({ success, error: "Comment Not Exists" })
    res.status(200).json({ success: true, comment })
  } catch (error) {
    console.log(error);
    res.status(500).json({ success, error: 'Internal Server Error' })
  }
}



module.exports = {
  AddContributors,
  AddThumbnail,
  DeleteProject,
  deleteFiles,
  AddFiles,
  AddTags,
  SearchProjects,
  GetSpecificUserProjects,
  updatedProject,
  AddProject,
  uploadFiles,
  UploadThumbnail,
  AddLike,
  GetAllProject,
  addComment,
  DeleteComment,
  getComments,
  CompleteProject
}