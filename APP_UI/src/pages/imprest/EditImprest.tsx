import { useEffect, useState } from "react";
import { Imprest } from "../../models/imprest.model";
import {
    getImprestById,
    getAllImprests,
    updateImprest,
} from "../../services/imprestService";
import { getUserRoleData } from "../../services/roleUser.svc";
import { toast } from "react-toastify";
import { FaPlusCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import MitteButton from "../../components/mitteButton/MitteButton";

interface ImprestProps {
    imprest: any;
    handleClose: () => void;

}

const EditImprest = ({
    imprest,
    handleClose,

}: ImprestProps) => {
    const imprestStatus = [
        { name: "Active", value: "true" },
        { name: "Inactive", value: "false" },
    ];

    const [loading, setLoading] = useState(false);
    const [imprestdetails, setImprestdetails] = useState<Imprest>({

        name: "",
        description: "",
        serialNo: "",
        phone_number_1: "",
        extension_1: "",
        phone_number_2: "",
        extension_2: "",
        hospital_id: "",
        active: false,
    });

    const [errors, setErrors] = useState({
        name: "",
        description: "",
        phone_number_1: "",
        extension_1: "",
        phone_number_2: "",
        extension_2: "",
        serialNo: "",
    });

    const handleChange = async (name: string, value: any) => {
        if (name === "active" && value === "false") {
            try {
                const response = await getUserRoleData();
                const users = response.data || [];

                const userWithMatchingImprest = users.find(
                    (user: any) => user.imprest_id === imprest.id
                );

                if (userWithMatchingImprest) {
                    toast.error(
                        "Cannot deactivate Imprest as it is associated with a user."
                    );

                    return;
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }

        if (name.startsWith("phone_number")) {
            const isValid = /^\d{10}$/.test(value.toString());
            setErrors((prev) => ({
                ...prev,
                [name]: isValid ? "" : "Mobile number must be exactly 10 digits long.",
            }));
        } else if (name.startsWith("extension")) {
            const isValid = /^\d{4,5}$/.test(value.toString());
            setErrors((prev) => ({
                ...prev,
                [name]: isValid ? "" : "Extension must be 4 to 5 digits long.",
            }));
        } else {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }

        setImprestdetails((prev) => ({ ...prev, [name]: value }));

        if (name === "name") {
            const existingImprests = await getAllImprests();
            const nameExists = existingImprests.some(
                (im: Imprest) => im.name === value
            );
            setErrors((prev) => ({
                ...prev,
                name: nameExists ? "Imprest name already exists" : "",
            }));
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const newErrors: any = {};

        if (!imprestdetails.name.trim()) {
            newErrors.name = "Name is required.";
        }
        if (!imprestdetails.description.trim()) {
            newErrors.description = "Description is required.";
        }
        if (!imprestdetails.serialNo.trim()) {
            newErrors.serialNo = "Serial Number is required.";
        }
        setErrors(newErrors);

        const isValid = Object.keys(newErrors).length === 0;

        if (isValid) {
            try {
                setLoading(true);
                await updateImprest(imprest.id, imprestdetails);
                toast.success("Successfully updated Imprest");
                setLoading(false);
                handleClose();
            } catch (error) {
                toast.error("Failed to update Imprest");
                setLoading(false);
                handleClose();
            }
        }
    };


    const loadOneImprest = async (id: number) => {
        try {
            const result = await getImprestById(id);
            setImprestdetails(result);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (imprest) {
            loadOneImprest(imprest.id);
        }
    }, [imprest]);

    return (
        <div className="modal-body p-4">
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status" />
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label">Name</label>
                            <input
                                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                value={imprestdetails.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                            />
                            <div className="invalid-feedback">{errors.name}</div>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Description</label>
                            <input
                                className={`form-control ${errors.description ? "is-invalid" : ""}`}
                                value={imprestdetails.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                            />
                            <div className="invalid-feedback">{errors.description}</div>
                        </div>
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label">Mobile Number 1</label>
                            <input
                                type="tel"
                                className={`form-control ${errors.phone_number_1 ? "is-invalid" : ""}`}
                                value={imprestdetails.phone_number_1}
                                onChange={(e) => handleChange("phone_number_1", e.target.value)}
                            />
                            <div className="invalid-feedback">{errors.phone_number_1}</div>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Extension 1</label>
                            <input
                                type="number"
                                className={`form-control ${errors.extension_1 ? "is-invalid" : ""}`}
                                value={imprestdetails.extension_1}
                                onChange={(e) => handleChange("extension_1", e.target.value)}
                            />
                            <div className="invalid-feedback">{errors.extension_1}</div>
                        </div>
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label">Mobile Number 2</label>
                            <input
                                type="tel"
                                className={`form-control ${errors.phone_number_2 ? "is-invalid" : ""}`}
                                value={imprestdetails.phone_number_2}
                                onChange={(e) => handleChange("phone_number_2", e.target.value)}
                            />
                            <div className="invalid-feedback">{errors.phone_number_2}</div>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Extension 2</label>
                            <input
                                type="number"
                                className={`form-control ${errors.extension_2 ? "is-invalid" : ""}`}
                                value={imprestdetails.extension_2}
                                onChange={(e) => handleChange("extension_2", e.target.value)}
                            />
                            <div className="invalid-feedback">{errors.extension_2}</div>
                        </div>
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label">Imprest Status</label>
                            <select
                                className="form-select"
                                value={imprestdetails.active === true ? "true" : "false"}
                                onChange={(e) => setImprestdetails((prev) => ({ ...prev, active: e.target.value === "true" ? true : false }))}
                            >
                                {imprestStatus.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Serial Number</label>
                            <input
                                type="text"
                                className={`form-control ${errors.serialNo ? "is-invalid" : ""}`}
                                value={imprestdetails.serialNo}
                                onChange={(e) => handleChange("serialNo", e.target.value)}
                            />
                            <div className="invalid-feedback">{errors.serialNo}</div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-center gap-3">
                        <MitteButton variant="success" onClick={handleSubmit} className="w-18" icon={<FaPlusCircle />}>
                            SAVE
                        </MitteButton>
                        <MitteButton className="text-white w-18" variant="warning" onClick={handleClose} icon={<MdCancel />}>CANCEL</MitteButton>
                    </div>
                </form>
            )}
        </div>
    );
};
export default EditImprest;
