import React, { useState, FormEvent } from 'react';
import { Role } from '../../models/role.model';
import { createRole, getRoles } from '../../services/role.svc';
import { toast } from 'react-toastify';
import { FaPlusCircle } from 'react-icons/fa';
import MitteButton from '../../components/mitteButton/MitteButton';
import { MdCancel } from 'react-icons/md';

interface AddRoleProps {
    handleclose: () => any;
}

const AddRole: React.FC<AddRoleProps> = ({ handleclose }) => {
    const initialRoleState: Role = {
        name: '',
        description: '',
    };

    const [roleData, setRoleData] = useState<Role>(initialRoleState);
    const [errors, setErrors] = useState<Role>(initialRoleState);
    const [loading, setLoading] = useState(false);

    const validateField = (name: string, value: string) => {
        let error = '';
        if (!value.trim()) {
            error = `${name === 'name' ? 'Role Name' : 'Description'} is required`;
        }
        return error;
    };

    const handleChange = (name: keyof Role, value: string) => {
        const error = validateField(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }));
        setRoleData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let isValid = true;
        const newErrors: Role = { ...errors };

        (Object.keys(roleData) as (keyof Role)[]).forEach((key) => {
            const error = validateField(key, roleData[key as keyof Role] as string);
            newErrors[key] = error;
            if (error) {
                isValid = false;
            }
        });

        if (isValid) {
            const roles = await getRoles();
            const roleExists = roles.some((r: Role) => r.name === roleData.name);

            if (roleExists) {
                newErrors.name = 'Role Name already exists';
                isValid = false;
            } else {
                newErrors.name = '';
            }
        }

        setErrors(newErrors);

        if (isValid) {
            try {
                setLoading(true);
                const createdRole = await createRole(roleData);
                if (createdRole) {
                    setLoading(false);
                    toast.success('You have SUCCESSFULLY added a new role');
                    handleclose();
                    setRoleData(initialRoleState);
                } else {
                    setLoading(false);
                    toast.error('Failed to create role');
                    handleclose();
                }
            } catch (error) {
                setLoading(false);
                toast.error('Failed to create role');
                handleclose();
                console.error('Error creating role:', error);
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
                <div className="container p-3">
                    <form>
                        <div className="row mt-3">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Role Name</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    value={roleData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                />
                                <div className="invalid-feedback">{errors.name}</div>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Description</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                    value={roleData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                />
                                <div className="invalid-feedback">{errors.description}</div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-center gap-3 mt-4">
                            <MitteButton variant="success" onClick={handleSubmit} className="uniform-btn" icon={<FaPlusCircle />}>
                                ADD
                            </MitteButton>
                            <MitteButton className="text-white uniform-btn" variant="warning" onClick={handleclose} icon={<MdCancel />}>CANCEL</MitteButton>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default AddRole;
