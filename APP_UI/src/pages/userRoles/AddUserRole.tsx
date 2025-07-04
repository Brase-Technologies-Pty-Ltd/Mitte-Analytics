import { FormEvent, useEffect, useState } from "react";
import { getusers } from "../../services/user.svc";
import { getRoles } from "../../services/role.svc";
import { getAllImprests, getImprests } from "../../services/imprestService";
import isAdmin from "../../services/auth.svc";
import { addUserRoleData } from "../../services/roleUser.svc";
import { Row, Col, Form } from "react-bootstrap";
import { UserRole } from "../../models/userRole.model";
import { Role } from "../../models/role.model";
import { User } from "../../models/user.model";
import { Imprest } from "../../models/imprest.model";
import { toast } from "react-toastify";
import MitteButton from "../../components/mitteButton/MitteButton";
import { FaPlusCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

interface DropdownOption {
    name: string;
    value: string;
}

const AddUserRole = ({ handleClose }: { handleClose: () => void }) => {
    const [users, setUsers] = useState<DropdownOption[]>([]);
    const [roles, setRoles] = useState<DropdownOption[]>([]);
    const [imprests, setImprests] = useState<DropdownOption[]>([]);
    const [userRoleData, setUserRoleData] = useState({
        user: "",
        role: "",
        imprest: "",
    });
    const [errors, setErrors] = useState({
        user: "",
        role: "",
        imprest: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchImprests();
    }, []);

    const fetchUsers = async () => {
        try {
            const res: User[] = await getusers();
            const activeUsers = res.filter((u) => u.active);
            setUsers(activeUsers.map((u) => ({ name: u.user_name, value: String(u.id) })));
        } catch (err) {
            console.error("Error fetching users", err);
        }
    };


    const fetchRoles = async () => {
        try {
            const res: Role[] = await getRoles();
            setRoles(res.map((r) => ({ name: r.name, value: String(r.id) })));
        } catch (err) {
            console.error("Error fetching roles", err);
        }
    };

    const fetchImprests = async () => {
        try {
            const res: Imprest[] = isAdmin() ? await getAllImprests() : await getImprests();
            setImprests(res.map((i) => ({ name: i.name, value: String(i.id) })));
        } catch (err) {
            console.error("Error fetching imprests", err);
        }
    };

    const validateField = (name: string, value: string) => {
        return !value ? `${name.charAt(0).toUpperCase() + name.slice(1)} is required` : "";
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserRoleData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Explicitly match the shape of the error state
        const newErrors: { user: string; role: string; imprest: string } = {
            user: "",
            role: "",
            imprest: "",
        };

        let valid = true;

        (Object.keys(userRoleData) as Array<keyof typeof userRoleData>).forEach((key) => {
            const error = validateField(key, userRoleData[key]);
            if (error) valid = false;
            newErrors[key] = error;
        });

        setErrors(newErrors);

        if (!valid) return;

        const data: UserRole = {
            user_id: Number(userRoleData.user),
            role_id: Number(userRoleData.role),
            imprest_id: Number(userRoleData.imprest),
        };

        setLoading(true);
        try {
            const response = await addUserRoleData(data);
            if (!response) throw new Error("Failed to assign user role.");
            toast.success("User role assigned successfully!");
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.error || err.message || "Failed to assign user role.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            handleClose();
        }
    };


    return (
        <form className="container p-3" onSubmit={handleSubmit}>

            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
                    <div className="spinner-border text-success" role="status" />
                </div>
            ) : (
                <>
                    <Row className="pt-4">
                        <Col md={6}>
                            <Form.Group controlId="user">
                                <Form.Label>Users</Form.Label>
                                <Form.Select name="user" value={userRoleData.user} onChange={handleChange} isInvalid={!!errors.user}>
                                    <option value="">Select User</option>
                                    {users.map((u) => (
                                        <option key={u.value} value={u.value}>
                                            {u.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.user}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="role">
                                <Form.Label>Role</Form.Label>
                                <Form.Select name="role" value={userRoleData.role} onChange={handleChange} isInvalid={!!errors.role}>
                                    <option value="">Select Role</option>
                                    {roles.map((r) => (
                                        <option key={r.value} value={r.value}>
                                            {r.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.role}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={6} className="mt-3">
                            <Form.Group controlId="imprest">
                                <Form.Label>Imprest</Form.Label>
                                <Form.Select name="imprest" value={userRoleData.imprest} onChange={handleChange} isInvalid={!!errors.imprest}>
                                    <option value="">Select Imprest</option>
                                    {imprests.map((i) => (
                                        <option key={i.value} value={i.value}>
                                            {i.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.imprest}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <MitteButton variant="success" onClick={handleSubmit} className="uniform-btn" icon={<FaPlusCircle />}>
                            ADD
                        </MitteButton>
                        <MitteButton className="text-white uniform-btn" variant="warning" onClick={handleClose} icon={<MdCancel />}>CANCEL</MitteButton>
                    </div>

                </>
            )}
        </form >
    );
};

export default AddUserRole;
