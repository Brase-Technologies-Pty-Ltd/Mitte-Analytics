import Camera from "../models/camera/camera.model.js";
import Imprest from "../models/imprest/imprest.model.js";
import Message from "../helpers/messages.js";

const addCamera = async (req, res) => {
    try {
        const { camera_name, serial_number, model, url, active } = req.body;
        const existingCamera = await Camera.findOne({
            where: {
                serial_number,
            },
        });

        if (existingCamera) {
            return res.status(400).json({ error: "Add Duplicate Camera not allowed." });
        }

        const newCamera = await Camera.create(
            {
                camera_name, serial_number, model, url, active
            },
        );

        return res.status(201).json(newCamera);
    } catch (error) {
        console.error("Error creating user role:", error);
        return res.status(500).json({ error: Message.SERVER_ERROR_MESSAGE });
    }
};


const updateCamera = async (req, res) => {
    try {
        const { id } = req.params;
        const cameraDetails = req.body;

        const camera = await Camera.findByPk(id);
        if (!camera) {
            return res.status(404).json({ error: "no camera found" });
        }
        const updatedImprest = await Camera.update(cameraDetails, { where: { id: id } });

        res.status(200).json({ Message: "Update success" });

    } catch (error) {
        res.status(400).json({ error: "Camera update failed" });
    }
};

const getAllCameras = async (req, res) => {
    try {
        const allCameras = await Camera.findAll({});

        return res.status(200).json(allCameras);
    } catch (error) {
        console.error("Error fetching cameras:", error);
        return res.status(500).json({ error: Message.SERVER_ERROR_MESSAGE });
    }
};

const getOnecamera = async (req, res) => {
    try {
        const id = req.params.id;
        const oneCamera = await Camera.findOne({
            where: { id: id }
        });

        if (!oneCamera) {
            return res.status(404).json({ error: Message.NOT_FOUND_MESSAGE });
        }

        return res.status(200).json(oneCamera);
    } catch (error) {
        console.error("Error fetching Camera:", error);
        return res.status(500).json({ error: Message.SERVER_ERROR_MESSAGE });
    }
};

const deleteCamera = async (req, res) => {
    const { id } = req.params;
    try {
        const camera = await Camera.findByPk(id);
        if (!camera) {
            res.status(404).json({ message: "Camera not found" });
            return;
        }

        const allImprests = await Imprest.findAll();

        for (let i = 0; i < allImprests.length; i++) {
            const imprest = allImprests[i];
            const serialNumbers = imprest.serial_number.split(',');

            if (serialNumbers.includes(camera.serial_number)) {
                res.status(200).json({ message: "Cannot delete camera as it is associated with imprest records" });
                return;
            }
        }
        await camera.destroy();

        res.status(200).json({ message: "you have DELETED selected Camera !!!"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


export default {
    addCamera,
    updateCamera,
    getAllCameras,
    getOnecamera,
    deleteCamera,
};