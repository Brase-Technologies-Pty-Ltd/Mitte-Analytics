import { useEffect, useState } from "react";
import { ImprestProduct } from "../../models/imprestProduct.model";
import { getImprests } from "../../services/imprestService";
import { getProducts, updateImprestProduct } from "../../services/imprestProductService";
import { toast } from "react-toastify";
import SelectWithSearch from "../../components/mitteSelectWithSearch/MitteSelectwithsearch";
import MitteButton from "../../components/mitteButton/MitteButton";
import { FaPlusCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

const EditImprestProduct = ({
    handleClose,
    selectedImprestProduct
}: any) => {
    const [products, setProducts] = useState<any>([]);
    const [imprests, setImprests] = useState<any>([]);
    const [imprestProducts, setImprestProducts] = useState<ImprestProduct>({
        product_id: "",
        imprest_id: "",
        hospital_id: "",
        min_stock: "",
        max_stock: "",
        available_stock: "",
    });

    const [errors, setErrors] = useState({
        product_id: "",
        imprest_id: "",
        min_stock: "",
        max_stock: "",
        available_stock: "",
    });

    useEffect(() => {
        fetchImprests();
        fetchProducts();
        if (selectedImprestProduct) {
            setImprestProducts(selectedImprestProduct);
        }
    }, [selectedImprestProduct]);

    const fetchImprests = async () => {
        try {
            const response = await getImprests();
            const keyValues = response.map((imprest: any) => ({
                label: imprest.name,
                value: imprest.id
            }))
            setImprests(keyValues);
        } catch (error) {
            console.error("Fetch Imprests failed:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const keyValues = await getProducts();
            setProducts(keyValues);
        } catch (error) {
            console.error("Fetch Products failed:", error);
        }
    };

    const handleChange = (name: string, value: string | number) => {
        setImprestProducts({ ...imprestProducts, [name]: value });
        setErrors({ ...errors, [name]: "" });
    };

    const handleSubmit = async () => {
        let isValid = true;
        const newErrors = { ...errors };

        if (!imprestProducts.product_id) {
            newErrors.product_id = "Product Name is required";
            isValid = false;
        }
        if (!imprestProducts.imprest_id) {
            newErrors.imprest_id = "Imprest Name is required";
            isValid = false;
        }
        if (!imprestProducts.min_stock) {
            newErrors.min_stock = "Minimum Stock is required";
            isValid = false;
        }
        if (!imprestProducts.max_stock) {
            newErrors.max_stock = "Maximum Stock is required";
            isValid = false;
        }
        if (!imprestProducts.available_stock) {
            newErrors.available_stock = "Available Stock is required";
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            try {
                const updated = await updateImprestProduct(selectedImprestProduct.id, imprestProducts);
                if (updated) {
                    toast.success("Successfully updated Imprest Product");
                    handleClose();
                } else {
                    toast.error("Update failed. Try again.");
                }
            } catch (error) {
                toast.error("Failed to update Imprest Product");
            }
        }
    };

    return (
        <div className="container p-4">
            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Product Name</label>
                    <SelectWithSearch
                        options={products}
                        placeholder="Select Product"
                        value={imprestProducts.product_id as any}
                        onSelect={(e: any) => {
                            setImprestProducts({
                                ...imprestProducts,
                                product_id: e.value
                            });
                        }}
                    />
                    <span className="text-danger">{errors.product_id}</span>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Imprest Name</label>
                    <SelectWithSearch
                        options={imprests}
                        placeholder="Select Imprest"
                        value={imprestProducts.imprest_id as any}
                        onSelect={(e: any) => {
                            setImprestProducts({
                                ...imprestProducts,
                                imprest_id: e.value
                            });
                        }}
                    />
                    <span className="text-danger">{errors.imprest_id}</span>
                </div>
            </div>

            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Minimum Stock</label>
                    <input
                        type="number"
                        className={`form-control ${errors.min_stock ? "is-invalid" : ""}`}
                        value={imprestProducts.min_stock}
                        onChange={(e) => handleChange("min_stock", e.target.value)}
                    />
                    <div className="invalid-feedback">{errors.min_stock}</div>
                </div>
                <div className="col-md-6">
                    <label className="form-label">Maximum Stock</label>
                    <input
                        type="number"
                        className={`form-control ${errors.max_stock ? "is-invalid" : ""}`}
                        value={imprestProducts.max_stock}
                        onChange={(e) => handleChange("max_stock", e.target.value)}
                    />
                    <div className="invalid-feedback">{errors.max_stock}</div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-6">
                    <label className="form-label">Available Stock</label>
                    <input
                        type="number"
                        className={`form-control ${errors.available_stock ? "is-invalid" : ""}`}
                        value={imprestProducts.available_stock}
                        onChange={(e) => handleChange("available_stock", e.target.value)}
                    />
                    <div className="invalid-feedback">{errors.available_stock}</div>
                </div>
            </div>
            <div className="d-flex justify-content-center gap-3 mt-4">
                <MitteButton variant="success" onClick={handleSubmit} className="uniform-btn" icon={<FaPlusCircle />}>
                    SAVE
                </MitteButton>
                <MitteButton className="text-white uniform-btn" variant="warning" onClick={handleClose} icon={<MdCancel />}>CANCEL</MitteButton>
            </div>
        </div>
    );
};

export default EditImprestProduct;
