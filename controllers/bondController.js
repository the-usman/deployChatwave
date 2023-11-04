const Bonds = require("../model/Bonds");
const mongoose = require('mongoose')
const UserModel = require("../model/User");

const sendBonds = async (req, res) => {
    try {
        const bondId = req.params.id;
        const userId = req.user.id;
        if (bondId === userId) {
            return res.status(400).json({ success: false, error: "Cannot bond with yourself" });
        }

        const user = await UserModel.findById(bondId);
        if (!user || !user.isConfirmed) {
            return res.status(400).json({ success: false, error: "User not found or not confirmed" });
        }

        if (!await UserModel.findById(userId)) {
            return res.status(400).json({ success: false, error: "User not found or not confirmed" });
        }

        let bond = await Bonds.findOne({ user: userId });

        if (bond) {
            if (bond.bondRequests.includes(bondId)) {
                return res.status(400).json({ success: false, error: "Request already sent" });
            }
            if (!bond.bondSents.includes(bondId)) {
                bond.bondSents.push(bondId);
                await bond.save();
            }
        } else {
            const newBond = await Bonds.create({
                user: userId,
                bondSents: [bondId]
            });
            bond = newBond;
        }

        let bondIdUser = await Bonds.findOne({ user: bondId });

        if (!bondIdUser) {
            const newBondIdUser = await Bonds.create({
                user: bondId,
                bondRequests: [userId]
            });
            bondIdUser = newBondIdUser;
        } else if (!bondIdUser.bondRequests.includes(userId)) {
            bondIdUser.bondRequests.push(userId);
            await bondIdUser.save();
        }

        bond = await bond.populate({
            path: "bonds bondRequests bondSents",
            select: "pic name username email"
        });

        res.status(200).json({ success: true, bond });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

const AcceptBonds = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const user = await UserModel.findById(id);
        if (!user || !user.isConfirmed) {
            return res.status(400).json({ success: false, error: "User not found or not confirmed" });
        }

        if (!await UserModel.findById(userId)) {
            return res.status(400).json({ success: false, error: "User not found or not confirmed" });
        }

        let bond = await Bonds.findOne({ user: userId });
        let requestedBond = await Bonds.findOne({ user: id });

        if (!bond || !requestedBond) {
            return res.status(400).json({ success: false, error: "No bond found for one of the users" });
        }

        if (bond.bonds.includes(id)) {
            return res.status(401).json({ success: false, error: "User is already in your bonds" });
        }
        bond.bondRequests = bond.bondRequests.filter(idInArray => idInArray.toString() !== id);
        bond.bonds.push(id);

        requestedBond.bondSents = requestedBond.bondSents.filter(idInArray => idInArray.toString() !== userId);
        requestedBond.bonds.push(userId);

        await bond.save();
        await requestedBond.save();

        bond = await bond.populate({
            path: "bonds bondRequests bondSents",
            select: "pic name username email"
        });

        res.status(200).json({ success: true, bond });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};


const RejectBonds = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const user = await UserModel.findById(id);
        if (!user || !user.isConfirmed) {
            return res.status(400).json({ success: false, error: "User not found or not confirmed" });
        }

        if (!await UserModel.findById(userId)) {
            return res.status(400).json({ success: false, error: "User not found or not confirmed" });
        }

        let bond = await Bonds.findOne({ user: userId });
        let requestedBond = await Bonds.findOne({ user: id });

        if (!bond || !requestedBond) {
            return res.status(400).json({ success: false, error: "No bond found for one of the users" });
        }

        if (bond.bonds.includes(id)) {
            return res.status(401).json({ success: false, error: "User is already in your bonds" });
        }

        bond.bondRequests = bond.bondRequests.filter(idInArray => idInArray.toString() !== id);

        requestedBond.bondSents = requestedBond.bondSents.filter(idInArray => idInArray.toString() !== userId);

        await bond.save();
        await requestedBond.save();

        bond = await bond.populate({
            path: "bonds bondRequests bondSents",
            select: "pic name username email"
        });

        res.status(200).json({ success: true, bond });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

const getBonds = async (req, res) => {
    try {
        const id = req.user.id;

        if (!await UserModel.findById(id)) {
            return res.status(400).json({ success: false, error: "User not found or not confirmed" });
        }

        let bond = await Bonds.findOne({ user: id });
        if (!bond) {
            const newBond = await Bonds.create(
                {
                    user: id,
                    bondRequests: [],
                    bondSents: []
                }
            );
            bond = newBond;
        }

        bond = await bond.populate({
            path: "bonds bondRequests bondSents",
            select: "pic name username email"
        });

        res.status(200).json({ success: true, bond });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};


const RemoveBond = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        let user = await Bonds.findOne({ user: userId });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: "This user is not in your bonds"
            });
        }

        let userToRemove = await Bonds.findOne({ user: id });
        if (!userToRemove) {
            return res.status(400).json({
                success: false,
                error: "This user is not in your bonds"
            });
        }

        user.bonds = user.bonds.filter(bondId => bondId.toString() !== id.toString());
        userToRemove.bonds = userToRemove.bonds.filter(bondId => bondId.toString() !== userId.toString());

        await user.save();
        await userToRemove.save();

        user = await user.populate({
            path: "bonds bondRequests bondSents",
            select: "pic name username email"
        });

        res.status(200).json({ success: true, bond: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};


module.exports = {
    getBonds,
    AcceptBonds,
    sendBonds,
    RejectBonds,
    RemoveBond
};
