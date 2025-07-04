import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import MitteButton from "../../components/mitteButton/MitteButton";
import { FaPlusCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { toast } from "react-toastify";
import { updateCamera } from "../../services/cameraService";
import { getAllImprests } from "../../services/imprestService";

interface Camera {
    id: number;
    camera_name: string;
    model: string;
    serial_number: string;
    url: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;

}

interface EditCameraProps {
    onClose?: () => void;
    camera: any;
}

const EditCamera: React.FC<EditCameraProps> = ({ onClose, camera }) => {
    const [cameraDetails, setCameraDetails] = useState<Camera>({
        ...camera,
        active: Boolean(camera.active === true || camera.active === "true"),
    });

    const [errors, setErrors] = useState<any>({});
    const [urlValid, setUrlValid] = useState(true);
    const [isSerialNumberPresent, setIsSerialNumberPresent] = useState(false);

    const handleChange = async (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        let newErrors: any = { ...errors };
        let updatedCamera = { ...cameraDetails, [name]: value };

        setCameraDetails(updatedCamera);

        if (name === "camera_name" || name === "model" || name === "serial_number") {
            newErrors[name] = value.trim() ? "" : `${name} is required`;
        } else if (name === "url") {
            const isValidUrl = isValidURL(value);
            setUrlValid(isValidUrl);
            if (!isValidUrl) {
                newErrors.url = "Enter a valid URL";
            } else {
                newErrors.url = "";
            }
        }

        setErrors(newErrors);
    };


    const isValidURL = (url: string) => {
        const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9]+[.-_])*([a-zA-Z0-9]+\.[a-zA-Z]{2,})$/i;
        return urlPattern.test(url);
    };

    const handleCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target;
        setCameraDetails({ ...cameraDetails, active: checked });
    };

    const handleSubmit = async () => {
        if (Object.values(errors).some((err) => err)) {
            toast.error("Please fix the errors before submitting.");
            return;
        }
        const response = await updateCamera(cameraDetails.id, cameraDetails);
        if (response) {
            toast.success("Camera updated successfully");
            onClose && onClose();
        }
    };

    useEffect(() => {
        const checkSerialNumberPresence = async () => {
            try {
                const response = await getAllImprests();
                if (response && response.length > 0) {
                    const serialNumbers = response.flatMap((user: any) =>
                        user.serial_number.split(",").map((s: string) => s.trim())
                    );

                    const serialNumberToFind = camera.serial_number.trim();

                    const isSerialNumberPresent =
                        serialNumbers.includes(serialNumberToFind);
                    setIsSerialNumberPresent(isSerialNumberPresent);
                } else {
                    console.error("Imprest data is empty or invalid");
                }
            } catch (error) {
                console.error("Error fetching imprest data:", error);
            }
        };

        checkSerialNumberPresence();
    }, [camera.serial_number]);

    return (
        <Container>
            <Form>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="camera_name">
                            <Form.Label>Camera Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="camera_name"
                                value={cameraDetails.camera_name}
                                onChange={handleChange}
                            />
                            {errors.camera_name && <Form.Text className="text-danger">{errors.camera_name}</Form.Text>}
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="model">
                            <Form.Label>Model</Form.Label>
                            <Form.Select
                                name="model"
                                value={cameraDetails.model}
                                onChange={handleChange}
                            >
                                <option value="">Select a model</option>
                                <option value="MV21/MV71">MV21/MV71</option>
                                <option value="MV52">MV52</option>
                                <option value="MV22">MV22</option>
                                <option value="MV12WE">MV12WE</option>
                                <option value="MV32">MV32</option>
                                <option value="MV22X/MV72X">MV22X/MV72X</option>
                            </Form.Select>
                            {errors.model && <Form.Text className="text-danger">{errors.model}</Form.Text>}
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="serial_number">
                            <Form.Label>Serial Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="serial_number"
                                value={cameraDetails.serial_number}
                                onChange={handleChange}
                            />
                            {errors.serial_number && <Form.Text className="text-danger">{errors.serial_number}</Form.Text>}
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="url">
                            <Form.Label>URL</Form.Label>
                            <Form.Control
                                type="text"
                                name="url"
                                value={cameraDetails.url}
                                onChange={handleChange}
                            />
                            {errors.url && <Form.Text className="text-danger">{errors.url}</Form.Text>}
                            {!urlValid && <Form.Text className="text-danger">Enter a valid URL</Form.Text>}
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="activeStatus">
                            <div className="d-flex">
                                <Form.Check
                                    inline
                                    type="checkbox"
                                    label="Active"
                                    name="active"
                                    checked={cameraDetails.active}
                                    onChange={handleCheckboxClick}
                                    disabled={isSerialNumberPresent}
                                />
                                {isSerialNumberPresent && (
                                    <span style={{ color: "red", fontSize: 13 }}>
                                        camera status is disabled because the camera assigned to
                                        imprest.
                                    </span>
                                )}
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
                <div className="d-flex justify-content-center gap-3">
                    <MitteButton variant="success" onClick={handleSubmit} className="uniform-btn" icon={<FaPlusCircle />}>
                        SAVE
                    </MitteButton>
                    <MitteButton className="text-white uniform-btn" variant="warning" onClick={onClose} icon={<MdCancel />}>CANCEL</MitteButton>
                </div>
            </Form>
        </Container>
    );
};

export default EditCamera;
