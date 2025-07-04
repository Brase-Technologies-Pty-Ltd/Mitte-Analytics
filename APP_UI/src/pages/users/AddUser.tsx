import { FormEvent, useState } from "react";
import { User } from "../../models/user.model";
import { createUser } from "../../services/userService";
import { toast } from "react-toastify";
import { FaPlusCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import MitteButton from "../../components/mitteButton/MitteButton";

const AddUser = ({
    handleClose,
    users,
}: any) => {
    const initialUserState: User = {
        user_name: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        email: "",
        active: true,
        password: "",
        confirmed_password: ""
    };

    const [userdata, setUserData] = useState<User>(initialUserState);
    const [errors, setErrors] = useState<User>(initialUserState);
    const [emailValid, setEmailValid] = useState(true);

    const isEmailValid = (email: string) =>
        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

    const validateField = (name: string, value: string | number) => {
        const trimmedValue = String(value).trim();

        switch (name) {
            case "first_name":
                return trimmedValue ? "" : "First Name is required";
            case "last_name":
                return trimmedValue ? "" : "Last Name is required";
            case "user_name":
                return trimmedValue ? "" : "Username is required";
            case "password":
                return trimmedValue ? "" : "Password is required";
            case "confirmed_password":
                if (!trimmedValue) return "Confirm Password is required";
                if (trimmedValue !== userdata.password) return "Confirm Password doesn't match";
                return "";
            case "phone_number":
                if (!trimmedValue) return "Mobile number is required";
                return /^\d{10}$/.test(trimmedValue) ? "" : "Mobile number should be exactly 10 digits";
            case "email":
                if (!trimmedValue) return "Email is required";
                return isEmailValid(trimmedValue) ? "" : "Enter a valid email";
            default:
                return "";
        }
    };


    const handleChange = (name: string, value: string) => {
        const error = validateField(name, value);
        setUserData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: error }));
        if (name === "email") setEmailValid(isEmailValid(value));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let isValid = true;
        const newErrors: any = { ...errors };

        for (const key in userdata) {
            const error = validateField(key, userdata[key as keyof User] as any);
            newErrors[key] = error;
            if (error) isValid = false;
        }

        if (!emailValid) {
            newErrors.email = "Email is required";
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            const emailExists = users.some(
                (user: User) => user.email.trim().toLowerCase() === userdata.email.trim().toLowerCase()
            );
            const usernameExists = users.some(
                (user: User) => user.user_name.trim().toLowerCase() === userdata.user_name.trim().toLowerCase()
            );
            const phoneExists = users.some(
                (user: User) => user.phone_number === userdata.phone_number
            );

            const duplicateErrors: Partial<User> = {};
            if (emailExists) duplicateErrors.email = "Email already exists";
            if (usernameExists) duplicateErrors.user_name = "Username already exists";
            if (phoneExists) duplicateErrors.phone_number = "Phone number already exists";

            if (emailExists || usernameExists || phoneExists) {
                setErrors((prev) => ({ ...prev, ...duplicateErrors }));
                toast.error("Email, Username, or Phone Number already exists");
                return;
            }

            try {
                const createdUser = await createUser(userdata);
                if (createdUser) {
                    toast.success("User added successfully");
                    handleClose();
                } else {
                    toast.error("Failed to create user");
                }
                setUserData(initialUserState);
            } catch (error) {
                toast.error("Failed to create user");
                handleClose();
                console.error("Error:", error);
            }
        }
    };

    return (
        <div className="p-3">
            <form>
                <div className="row mt-3">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">First Name</label>
                        <input
                            type="text"
                            className={`form-control ${errors.first_name ? "is-invalid" : ""}`}
                            value={userdata.first_name}
                            onChange={(e) => handleChange("first_name", e.target.value)}
                        />
                        <div className="invalid-feedback">{errors.first_name}</div>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Last Name</label>
                        <input
                            type="text"
                            className={`form-control ${errors.last_name ? "is-invalid" : ""}`}
                            value={userdata.last_name}
                            onChange={(e) => handleChange("last_name", e.target.value)}
                        />
                        <div className="invalid-feedback">{errors.last_name}</div>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">User Name</label>
                        <input
                            type="text"
                            className={`form-control ${errors.user_name ? "is-invalid" : ""}`}
                            value={userdata.user_name}
                            onChange={(e) => handleChange("user_name", e.target.value)}
                        />
                        <div className="invalid-feedback">{errors.user_name}</div>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Mobile Number</label>
                        <input
                            type="number"
                            className={`form-control ${errors.phone_number ? "is-invalid" : ""}`}
                            value={userdata.phone_number}
                            onChange={(e) => handleChange("phone_number", e.target.value)}
                        />
                        <div className="invalid-feedback">{errors.phone_number}</div>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="text"
                            className={`form-control ${errors.email ? "is-invalid" : ""}`}
                            value={userdata.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                        />
                        <div className="invalid-feedback">{errors.email}</div>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className={`form-control ${errors.password ? "is-invalid" : ""}`}
                            value={userdata.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                        />
                        <div className="invalid-feedback">{errors.password}</div>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className={`form-control ${errors.confirmed_password ? "is-invalid" : ""}`}
                            value={userdata.confirmed_password}
                            onChange={(e) => handleChange("confirmed_password", e.target.value)}
                        />
                        <div className="invalid-feedback">{errors.confirmed_password}</div>
                    </div>
                </div>
                <div className="d-flex justify-content-center gap-3 mt-4">
                    <MitteButton variant="success" onClick={handleSubmit} className="uniform-btn" icon={<FaPlusCircle />}>
                        ADD
                    </MitteButton>
                    <MitteButton className="text-white uniform-btn" variant="warning" onClick={handleClose} icon={<MdCancel />}>CANCEL</MitteButton>
                </div>
            </form>
        </div>
    );
};

export default AddUser;
