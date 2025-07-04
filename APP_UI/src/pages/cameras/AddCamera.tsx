import { FormEvent, useState } from "react";
import { Camera } from "../../models/camera.model";
import { createCamera, getCameras } from "../../services/cameraService";
import { toast } from "react-toastify";
import MitteButton from "../../components/mitteButton/MitteButton";
import { FaPlusCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

const AddCamera = ({
    handleClose
}: any) => {
    const initialCameraState: Camera = {
        id: "",
        camera_name: "",
        serial_number: "",
        model: "",
        url: "",
        active: true,
    };

    const camModels = [
        { value: "MV21/MV71", name: "MV21/MV71" },
        { value: "MV52", name: "MV52" },
        { value: "MV22", name: "MV22" },
        { value: "MV12WE", name: "MV12WE" },
        { value: "MV32", name: "MV32" },
        { value: "MV22X/MV72X", name: "MV22X/MV72X" },
    ];

    const [cameraData, setCameraData] = useState<Camera>(initialCameraState);
    const [errors, setErrors] = useState<Camera>(initialCameraState);
    const [loading, setLoading] = useState(false);
    const activeTitle = cameraData.active ? "Active" : "Inactive";

    const validateField = (name: string, value: string | number) => {
        let error = "";

        switch (name) {
            case "camera_name":
                error = String(value).trim() ? "" : "Camera Name is required";
                break;
            case "serial_number":
                error = String(value).trim() ? "" : "Serial Number is required";
                break;
            case "model":
                error = String(value).trim() ? "" : "Model is required";
                break;
            case "url":
                error = String(value).trim() ? "" : "Url is required";
                break;
            default:
                break;
        }
        return error;
    };

    const handleCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        handleChange("active", isChecked as any);
    };

    const handleChange = (name: string, value: string | number) => {
        const error = validateField(name, value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: error,
        }));
        setCameraData((prevCamData) => ({
            ...prevCamData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let isValid = true;
        const newErrors = { ...errors } as any;

        for (const key in cameraData) {
            if (cameraData.hasOwnProperty(key)) {
                const error = validateField(key, cameraData[key as keyof Camera] as any);
                newErrors[key as keyof Camera] = error;
                if (error) {
                    isValid = false;
                }
            }
        }

        if (isValid) {
            const cameras = await getCameras();
            const cameraNameExists = cameras.some(
                (camera: any) => camera.camera_name === cameraData.camera_name
            );
            const serialNumberExists = cameras.some(
                (camera: any) => camera.serial_number === cameraData.serial_number
            );

            if (cameraNameExists) {
                newErrors.camera_name = "Camera Name already exists";
                isValid = false;
            } else {
                newErrors.camera_name = "";
            }

            if (serialNumberExists) {
                newErrors.serial_number = "Serial Number already exists";
                isValid = false;
            } else {
                newErrors.serial_number = "";
            }
        }

        setErrors(newErrors);

        if (isValid) {
            try {
                setLoading(true);
                const createdCamera = await createCamera(cameraData);
                if (createdCamera) {
                    setLoading(false);
                    toast.success("You have SUCCESSFULLY added a new camera");
                    handleClose();
                    setCameraData(initialCameraState);
                } else {
                    setLoading(false);
                    toast.error("Failed to create user");
                    handleClose();
                    console.error("Error creating user:");
                }
            } catch (error) {
                setLoading(false);
                toast.error("Failed to create user");
                handleClose();
                console.error("Error creating user:", error);
            }
        }
    };

    return (
        <>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="container">
                    <form >
                        <div className="row mt-2">
                            <div className="col-md-6">
                                <label className="form-label">Camera Name</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.camera_name ? "is-invalid" : ""}`}
                                    value={cameraData.camera_name}
                                    onChange={(e) => handleChange("camera_name", e.target.value)}
                                />
                                <div className="invalid-feedback">{errors.camera_name}</div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Serial Number</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.serial_number ? "is-invalid" : ""}`}
                                    value={cameraData.serial_number}
                                    onChange={(e) => handleChange("serial_number", e.target.value)}
                                />
                                <div className="invalid-feedback">{errors.serial_number}</div>
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Model</label>
                                <select
                                    className={`form-select ${errors.model ? "is-invalid" : ""}`}
                                    value={cameraData.model}
                                    onChange={(e) => handleChange("model", e.target.value)}
                                >
                                    <option value="">Select Model</option>
                                    {camModels.map((model) => (
                                        <option key={model.value} value={model.value}>
                                            {model.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="invalid-feedback">{errors.model}</div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">URL</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.url ? "is-invalid" : ""}`}
                                    value={cameraData.url}
                                    onChange={(e) => handleChange("url", e.target.value)}
                                />
                                <div className="invalid-feedback">{errors.url}</div>
                            </div>
                        </div>

                        <div className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                checked={cameraData.active}
                                onChange={handleCheckboxClick}
                            />
                            <label className="form-check-label">{activeTitle}</label>
                        </div>


                        <div className="d-flex justify-content-center gap-3 mt-4">
                            <MitteButton variant="success" onClick={handleSubmit} className="uniform-btn" icon={<FaPlusCircle />}>
                                ADD
                            </MitteButton>
                            <MitteButton className="text-white uniform-btn" variant="warning" onClick={handleClose} icon={<MdCancel />}>CANCEL</MitteButton>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default AddCamera;
