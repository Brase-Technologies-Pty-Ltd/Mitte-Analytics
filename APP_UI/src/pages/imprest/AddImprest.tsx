import { useState, FormEvent } from 'react';
import { Imprest } from '../../models/imprest.model';
import { createImprest, getAllImprests } from '../../services/imprestService';
import { toast } from 'react-toastify';
import { FaPlusCircle } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import MitteButton from '../../components/mitteButton/MitteButton';

const AddImprest = ({ handleClose }: any) => {
    const initialImprestState: Imprest = {
        name: '',
        serialNo: '',
        description: '',
        phone_number_1: '',
        extension_1: '',
        phone_number_2: '',
        extension_2: '',
    };

    const [imprestData, setImprestData] = useState<Imprest>(initialImprestState);
    const [errors, setErrors] = useState<Imprest>(initialImprestState);
    const [loading, setLoading] = useState(false);

    const validateField = (name: string, value: string | number) => {
        let error = '';

        switch (name) {
            case 'name':
                error = String(value).trim() ? '' : 'Name is required';
                break;
            case 'serialNo':
                error = String(value).trim() ? '' : 'Serial number is required';
                break;
            case 'description':
                error = String(value).trim() ? '' : 'Description is required';
                break;
            case 'phone_number_1':
                error = /^\d{10}$/.test(String(value)) ? '' : 'Phone number 1 must be exactly 10 digits';
                break;
            case 'extension_1':
                error = /^\d{4,5}$/.test(String(value)) ? '' : 'Extension 1 must be 4 to 5 digits';
                break;
            case 'phone_number_2':
                error = /^\d{10}$/.test(String(value)) ? '' : 'Phone number 2 must be exactly 10 digits';
                break;
            case 'extension_2':
                error = /^\d{4,5}$/.test(String(value)) ? '' : 'Extension 2 must be 4 to 5 digits';
                break;

            default:
                break;
        }
        return error;
    };

    const handleChange = async (name: string, value: string | number) => {
        // Perform synchronous validation first
        let error = validateField(name, value);

        if (name === 'name' && !error) {
            // Check if the name already exists asynchronously
            const existingImprests = await getAllImprests();
            const nameExists = existingImprests.some((imprest: Imprest) => imprest.name === value);

            if (nameExists) {
                error = 'Imprest name already exists';
            }
        }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: error,
        }));

        setImprestData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let isValid = true;
        const newErrors = { ...errors } as any;

        for (const key in imprestData) {
            if (imprestData.hasOwnProperty(key)) {
                const error = validateField(key, imprestData[key as keyof Imprest] as any);
                newErrors[key as keyof Imprest] = error;
                if (error) {
                    isValid = false;
                }
            }
        }

        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            await createImprest(imprestData);
            toast.success('You have successfully added a new Imprest');
            handleClose();
        } catch (error) {
            toast.error('Failed to create imprest');
            console.error(error);
        } finally {
            setLoading(false);
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
                <div className="d-flex justify-content-center align-items-center">
                    <form>
                        <div className="row mt-3">
                            {/* Name */}
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={imprestData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                    />
                                    {errors.name && <div className="text-danger">{errors.name}</div>}
                                </div>
                            </div>

                            {/* Serial No */}
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="serialNo" className="form-label">Serial No</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="serialNo"
                                        name="serialNo"
                                        value={imprestData.serialNo}
                                        onChange={(e) => handleChange('serialNo', e.target.value)}
                                    />
                                    {errors.serialNo && <div className="text-danger">{errors.serialNo}</div>}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="description"
                                        name="description"
                                        value={imprestData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                    />
                                    {errors.description && <div className="text-danger">{errors.description}</div>}
                                </div>
                            </div>

                            {/* Phone Number 1 */}
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="phone_number_1" className="form-label">Phone Number 1</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="phone_number_1"
                                        name="phone_number_1"
                                        value={imprestData.phone_number_1}
                                        onChange={(e) => handleChange('phone_number_1', e.target.value)}
                                    />
                                    {errors.phone_number_1 && <div className="text-danger">{errors.phone_number_1}</div>}
                                </div>
                            </div>

                            {/* Extension 1 */}
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="extension_1" className="form-label">Extension 1</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="extension_1"
                                        name="extension_1"
                                        value={imprestData.extension_1}
                                        onChange={(e) => handleChange('extension_1', e.target.value)}
                                    />
                                    {errors.extension_1 && <div className="text-danger">{errors.extension_1}</div>}
                                </div>
                            </div>

                            {/* Phone Number 2 */}
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="phone_number_2" className="form-label">Phone Number 2</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="phone_number_2"
                                        name="phone_number_2"
                                        value={imprestData.phone_number_2}
                                        onChange={(e) => handleChange('phone_number_2', e.target.value)}
                                    />
                                    {errors.phone_number_2 && <div className="text-danger">{errors.phone_number_2}</div>}
                                </div>
                            </div>

                            {/* Extension 2 */}
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="extension_2" className="form-label">Extension 2</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="extension_2"
                                        name="extension_2"
                                        value={imprestData.extension_2}
                                        onChange={(e) => handleChange('extension_2', e.target.value)}
                                    />
                                    {errors.extension_2 && <div className="text-danger">{errors.extension_2}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Save and Cancel Buttons */}
                        <div className="d-flex justify-content-center gap-3">
                            <MitteButton variant="success" onClick={handleSubmit} className="w-18" icon={<FaPlusCircle />}>
                                ADD
                            </MitteButton>
                            <MitteButton className="text-white w-18" variant="warning" onClick={handleClose} icon={<MdCancel />}>CANCEL</MitteButton>
                        </div>
                    </form >
                </div >
            )}
        </>

    );

}
export default AddImprest;