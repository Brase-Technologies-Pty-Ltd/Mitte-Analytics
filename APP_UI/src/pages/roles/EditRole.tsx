import React, { useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import MitteButton from "../../components/mitteButton/MitteButton";
import { FaPlusCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { toast } from "react-toastify";
import { updateRole } from "../../services/role.svc";
import { Role } from "../../models/role.model";

interface EditRoleProps {
    handleclose?: () => void;
    role: any;
}

const EditRole: React.FC<EditRoleProps> = ({ handleclose, role }) => {
    const [roleDetails, setRoleDetails] = useState<Role>(role);
    const [errors, setErrors] = useState<any>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedRole = { ...roleDetails, [name]: value };
        setRoleDetails(updatedRole);

        const newErrors = { ...errors };
        newErrors[name] = value.trim() === "" ? `${name} is required` : "";
        setErrors(newErrors);
    };

    const validateForm = () => {
        const newErrors: any = {};
        if (!roleDetails.name.trim()) newErrors.name = "Role name is required";
        if (!roleDetails.description.trim()) newErrors.description = "Description is required";
        setErrors(newErrors);
        return Object.values(newErrors).every((err) => err === "");
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error("Please fix the errors before submitting.");
            return;
        }

        const response = await updateRole(roleDetails);
        if (response) {
            toast.success("Role updated successfully");
            handleclose && handleclose();
        } else {
            toast.error("Failed to update role");
        }
    };

    return (
        <Container>
            <Form>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="name">
                            <Form.Label>Role Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={roleDetails.name}
                                onChange={handleChange}
                            />
                            {errors.name && <Form.Text className="text-danger">{errors.name}</Form.Text>}
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="description">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                name="description"
                                value={roleDetails.description}
                                onChange={handleChange}
                            />
                            {errors.description && <Form.Text className="text-danger">{errors.description}</Form.Text>}
                        </Form.Group>
                    </Col>
                </Row>
                <div className="d-flex justify-content-center gap-3">
                    <MitteButton variant="success" onClick={handleSubmit} className="uniform-btn" icon={<FaPlusCircle />}>
                        SAVE
                    </MitteButton>
                    <MitteButton className="text-white uniform-btn" variant="warning" onClick={handleclose} icon={<MdCancel />}>
                        CANCEL
                    </MitteButton>
                </div>
            </Form>
        </Container>
    );
};

export default EditRole;
