import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import MitteButton from "../../components/mitteButton/MitteButton";
import { FaPlusCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { toast } from "react-toastify";
import { getUserRoleData, getusers, updateUser } from "../../services/userService";
import MitteModal from "../../components/mitte-Modal/MitteModel";
import ResetPasswordFromEdit from "./ResetPassFromEdit";

interface User {
    id: number;
    user_name: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    created_by: number;
    modified_by: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}


interface EditUserProps {
    onClose?: () => void;
    users: any
}

const EditUser: React.FC<EditUserProps> = ({ onClose, users }) => {
    const [user, setUser] = useState<User>(users);
    const [errors, setErrors] = useState<any>({});
    const [emailValid, setEmailValid] = useState(true);
    const [imprestExists, setImprestExists] = useState(true);
    const [openResetPassModal, setOpenResetPassModal] = useState<boolean>(false);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let newErrors: any = { ...errors };
        let updatedUser = { ...user, [name]: value };

        setUser(updatedUser);

        if (name === "user_name") {
            try {
                const existingUsers = await getusers();
                const usernameExists = existingUsers.some(
                    (u: any) => u.user_name === value && u.id !== user.id
                );
                newErrors.user_name = usernameExists ? "Username already exists" : "";
            } catch (error) {
                console.error("Error checking username:", error);
            }
        } else if (name === "email") {
            const isValid = isEmailValid(value);
            setEmailValid(isValid);

            if (!isValid) {
                newErrors.email = "Enter a valid email";
            } else {
                try {
                    const existingUsers = await getusers();
                    const emailExists = existingUsers.some(
                        (u: any) => u.email === value && u.id !== user.id
                    );
                    newErrors.email = emailExists ? "Email already exists" : "";
                } catch (error) {
                    console.error("Error checking email:", error);
                }
            }
        } else if (name === "phone_number") {
            if (!/^\d{10}$/.test(value)) {
                newErrors.phone_number = "Mobile number should be exactly 10 digits";
            } else {
                newErrors.phone_number = "";
            }
        } else if (name === "first_name") {
            if (!value) {
                newErrors.first_name = "First name is required";
            } else {
                newErrors.first_name = "";
            }
        } else if (name === "last_name") {
            if (!value) {
                newErrors.last_name = "Last name is required";
            } else {
                newErrors.last_name = "";
            }
        }

        setErrors(newErrors);
    };

    const isEmailValid = (email: string) => {
        const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        return emailPattern.test(email);
    };

    const checkUserImprestExistence = async () => {
        const result = await getUserRoleData();
        if (result) {
            const userRoles = result.data;
            const userExists = userRoles.some(
                (role: any) => role.user_id === users.id
            );
            setImprestExists(userExists);
        } else {
            setImprestExists(true);
        }
    };

    const handleCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (imprestExists) {
            toast.warn("User is Assigned to Imprest and cannot be deactivated.");
            return;
        }
        const { checked } = e.target;
        setUser({ ...user, active: checked });
    };

    const handleSubmit = async () => {
        let newErrors: any = {};
        if (!user.first_name?.trim()) newErrors.first_name = "First name is required";
        if (!user.last_name?.trim()) newErrors.last_name = "Last name is required";
        if (!user.user_name?.trim()) newErrors.user_name = "Username is required";
        if (!user.email?.trim()) newErrors.email = "Email is required";
        if (!user.phone_number?.trim()) newErrors.phone_number = "Phone number is required";

        newErrors = { ...errors, ...newErrors };

        setErrors(newErrors);

        if (Object.values(newErrors).some((err) => err)) {
            toast.error("Please fill all required fields correctly.");
            return;
        }

        const response = await updateUser(user.id, user);
        if (response) {
            toast.success("User updated successfully");
            onClose && onClose();
        }
    };


    useEffect(() => {
        checkUserImprestExistence();
    }, []);

    return (
        <>
            <Container>
                <Form>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="first_name">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="first_name"
                                    value={user.first_name}
                                    onChange={handleChange}
                                />
                                {errors.first_name && <Form.Text className="text-danger">{errors.first_name}</Form.Text>}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="last_name">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="last_name"
                                    value={user.last_name}
                                    onChange={handleChange}
                                />
                                {errors.last_name && <Form.Text className="text-danger">{errors.last_name}</Form.Text>}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="user_name">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="user_name"
                                    value={user.user_name}
                                    onChange={handleChange}
                                />
                                {errors.user_name && <Form.Text className="text-danger">{errors.user_name}</Form.Text>}

                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    onChange={handleChange}
                                />
                                {errors.email && <Form.Text className="text-danger">{errors.email}</Form.Text>}
                                {!emailValid && <Form.Text className="text-danger">Enter a valid email</Form.Text>}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="phone_number">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phone_number"
                                    value={user.phone_number}
                                    onChange={handleChange}
                                />
                                {errors.phone_number && <Form.Text className="text-danger">{errors.phone_number}</Form.Text>}

                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={6}>
                            <span onClick={() => setOpenResetPassModal(true)} style={{ cursor: "pointer" }} className="text-muted fw-bold fs-6">Change Password ?</span>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="activeStatus">
                                <div>
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        label="Active"
                                        name="active"
                                        value={user.active ? "true" : "false"}
                                        checked={user.active ? true : false}
                                        onChange={handleCheckboxClick}
                                    />
                                    {errors.active && <Form.Text className="text-danger">{errors.active}</Form.Text>}
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
            {
                openResetPassModal && (
                    <MitteModal
                        onClose={() => setOpenResetPassModal(false)}
                        show={openResetPassModal}
                        headerText="RESET PASSWORD"
                        size='lg'
                        handleHeaderBtn={() => setOpenResetPassModal(false)}
                        modalBodyComponent={<ResetPasswordFromEdit handleModalClose={() => setOpenResetPassModal(false)} userId={users.id} />}
                    />

                )
            }
        </>
    );
};

export default EditUser;
