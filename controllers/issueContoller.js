const Issue = require('../model/Issue');
const User = require('../model/User');
const Like = require('../model/Likes');
const Solution = require('../model/Solution');
const fs = require('fs')
const multer = require('multer')

const AddThumbnailStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const baseDirectory = 'issue/';
        const issueid = req.params.issueid;
        const finalDirectory1 = path.join(baseDirectory, req.user.id);
        if (!fs.existsSync(finalDirectory1)) {
            fs.mkdirSync(finalDirectory1, { recursive: true }, (err) => {
                if (err) {
                    console.error('Error creating directory:', err);
                }
            });
        }
        const finalDirectory2 = path.join(finalDirectory1, issueid);
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


const UploadThumbnail = multer({
    storage : AddThumbnailStorage
}).single('file')



const Uploadfiles = multer.diskStorage({
    destination: () => {

    }
})
const ReturnIssue = async (id) => {
    let issue = await Issue.findById(id).populate({
        path: "user likes.user solutions.user",
        select: "pic name username"
    })
    // issue = issue.populate("solutions")
    return issue;
}

const ReturnSolution = async (id) => {
    let solution = await Solution.findById(id).populate({
        path: "user boost.user",
        select: "pic name username"
    })
    return solution;
}

const addIssue = async (req, res) => {
    let success = true;
    try {
        const { data, name } = req.body;
        if (!data || !name) {
            res.status(400).json({ error: "Data is not recived", success })
        }
        const userId = req.user.id;
        let issue = await Issue.create({
            name: name,
            user: userId,
            data: data
        });
        issue = await ReturnIssue(issue.id)
        return res.status(200).json({ issue, success: true })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error", success })
    }
}

const deleteIssue = async () => {

}

const addSolution = async (req, res) => {
    let success = false;
    try {
        const issueid = req.params.issueid;
        const { data } = req.body;
        if (!data)
            return res.status(401).json({ error: "Data not Found" })
        console.log(issueid)
        const issue = await Issue.findById(issueid);
        if (!issue) {
            return res.status(400).json({ error: "Issue not found", success: false })
        }
        let solution = await Solution.create({
            user: req.user.id,
            data: data,
        })
        issue.solutions.push(solution)
        await issue.save();
        solution = await ReturnSolution(solution);
        return res.status(200).json({ solution, successs: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" })
    }
}

const removeSolution = async () => {

}


const booastSolution = async () => {

}

const DeleteSolution = async () => {

}


const addImage = async () => {

}

const ShuffleIssue = (array) => {
    return array.sort(() => 0.5 - Math.random())
}

const getIssues = async (req, res) => {
    let success = false;
    try {
        const page = req.query.page || 1;
        const pageSize = req.body.pageSize || 5;
        const jump = (page - 1) * pageSize;
        let issues = await Issue.find()
            .populate({
                path: "user likes.user solutions.user",
                select: "pic name username"
            }).populate("solutions")
            .limit(pageSize)
            .skip(jump)
            .sort({
                updatedAt: -1
            })

        issues = ShuffleIssue(issues)
        return res.status(200).json({ issues, success: true })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error", success })
    }
}

const getSpecificUserIssues = async () => {

}


const getSpecificUserSolution = async () => {

}


const getSolutions = async () => {

}


const searchIssues = async () => {

}


module.exports = {
    addIssue,
    getIssues,
    addSolution
}