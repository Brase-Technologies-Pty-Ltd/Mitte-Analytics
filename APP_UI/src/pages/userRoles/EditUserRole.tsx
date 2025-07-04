import { useEffect, useState } from "react";
import { getusers } from "../../services/user.svc";
import { getRoles } from "../../services/role.svc";
import { getOneUserRoleData, updateUserRoleData } from "../../services/roleUser.svc";
import { getAllImprests, getImprests } from "../../services/imprestService";
import { Container, Row, Col, Form, Spinner } from "react-bootstrap";
import { FaPlusCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import isAdmin from "../../services/auth.svc";
import { User } from "../../models/user.model";
import { Role } from "../../models/role.model";
import { Imprest } from "../../models/imprest.model";
import { toast } from "react-toastify";
import MitteButton from "../../components/mitteButton/MitteButton";

interface UserRoleProps {
    id?: any;
    handleClose: () => void;
}

const EditUserRole = ({ id, handleClose }: UserRoleProps) => {
    const [users, setUsers] = useState<any>([]);
    const [roles, setRoles] = useState([]);
    const [imprests, setImprests] = useState([]);
    const [userRoleData, setUserRoleData] = useState({ user: "", role: "", imprest: "" });
    const [originalUserRoleData, setOriginalUserRoleData] = useState({ user: "", role: "", imprest: "" });
    const [loading, setLoading] = useState(false);

    const userRoleId = id ?? -1;


    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchImprests();
        if (userRoleId) {
            fetchUserRoleForEdit(userRoleId);
        }
    }, [userRoleId]);

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
        const data = await getRoles();
        const options = data.map((r: Role) => ({ name: r.name, value: r.id }));
        setRoles(options);
    };


    const fetchImprests = async () => {
        const data = await isAdmin() ? await getAllImprests() : await getImprests();
        const options = data.map((i: Imprest) => ({ name: i.name, value: i.id }));
        setImprests(options);
    };

    const fetchUserRoleForEdit = async (id: number) => {
        try {
            setLoading(true);
            const response = await getOneUserRoleData(id);
            if (response && response.status === 200) {
                const roleData = response.data;

                const mappedData = {
                    user: roleData.user.id.toString(),
                    role: roleData.role.id.toString(),
                    imprest: roleData.imprest.id.toString(),
                };
                setUserRoleData(mappedData);
                setOriginalUserRoleData(mappedData);
            }
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserRoleData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            if (!userRoleData.user || !userRoleData.role || userRoleData.imprest === "") {
                if (!userRoleData.user) {
                    toast.error("User is required.");
                }
                if (!userRoleData.role) {
                    toast.error("Role is required.");
                }
                if (userRoleData.imprest === "") {
                    toast.error("Imprest is required.");
                }
                return;
            }
            if (id) {
                setLoading(true);
                const noChange =
                    userRoleData.user === originalUserRoleData.user &&
                    userRoleData.role === originalUserRoleData.role &&
                    userRoleData.imprest === originalUserRoleData.imprest;

                if (noChange) {
                    toast.warning("No changes detected.");

                } else {
                    const response = await updateUserRoleData(userRoleId, userRoleData);
                    if (response) {
                        toast.success("You have successfully updated the role for the user.");
                        handleClose();
                    }
                }
            }
        } catch (error) {
            toast.error("User Role update failed.");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            {loading ? (
                <div className="d-flex justify-content-center p-4">
                    <Spinner animation="border" />
                </div>
            ) : (
                <Form className="mt-4">
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="user">
                                <Form.Label>Users</Form.Label>
                                <Form.Select name="user" value={userRoleData.user} onChange={handleChange}>
                                    <option value="">Select User</option>
                                    {users.map((u: any) => (
                                        <option key={u.value} value={u.value}>{u.name}</option> // Here u.name should be u.user_name or similar
                                    ))}
                                </Form.Select>

                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="role">
                                <Form.Label>Role</Form.Label>
                                <Form.Select name="role" value={userRoleData.role} onChange={handleChange}>
                                    <option value="">Select Role</option>
                                    {roles.map((r: any) => (
                                        <option key={r.value} value={r.value}>{r.name}</option> // Here r.name should be role name
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6} className="mt-3">
                            <Form.Group controlId="imprest">
                                <Form.Label>Imprest</Form.Label>
                                <Form.Select name="imprest" value={userRoleData.imprest} onChange={handleChange}>
                                    <option value="">Select Imprest</option>
                                    {imprests.map((i: any) => (
                                        <option key={i.value} value={i.value}>{i.name}</option> // Ensure to access name inside imprest object
                                    ))}
                                </Form.Select>

                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <MitteButton variant="success" onClick={handleSubmit} className="uniform-btn" icon={<FaPlusCircle />}>
                            SAVE
                        </MitteButton>
                        <MitteButton className="text-white uniform-btn" variant="warning" onClick={handleClose} icon={<MdCancel />}>CANCEL</MitteButton>
                    </div>
                </Form>
            )}
        </Container>
    );
};

export default EditUserRole;
