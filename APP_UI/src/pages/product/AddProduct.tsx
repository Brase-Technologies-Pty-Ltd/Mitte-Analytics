import { useState, useEffect } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { getBrands, getGenerics, getPackUoms, getProductForms, getProducts, getUoms } from "../../services/commonService";
import SelectWithSearch from "../../components/mitteSelectWithSearch/MitteSelectwithsearch";
import { toast } from "react-toastify";
import { createProduct } from "../../services/productService";
import BarCodeGenerator from "../../components/barCodeGenerater/BarCodeGenerator";
import { FaPlusCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import MitteButton from "../../components/mitteButton/MitteButton";

const AddProduct = ({ handleClose }: any) => {
    const [generic, setGeneric] = useState<any>([]);
    const [brand, setBrand] = useState<any>([]);
    const [packuom, setPackuom] = useState<any>([]);
    const [uom, setUom] = useState<any>([]);
    const [productform, setProductform] = useState<any>([]);
    const [existingProducts, setExistingProducts] = useState([]);
    const [isBarCodeVisible, setIsBarCodeVisible] = useState(false)

    const [product, setProduct] = useState({
        description: "",
        strength: "",
        short_code: "",
        pack_size: "",
        pack_uom_id: "",
        measure_id: "",
        product_form_id: "",
        brand_id: "",
        generic_id: "",
    });
    const [errors, setErrors] = useState({
        description: "",
        strength: "",
        short_code: "",
        pack_size: "",
        pack_uom_id: "",
        measure_id: "",
        product_form_id: "",
        brand_id: "",
        generic_id: "",
    });

    const handleSubmit = async () => {
        let isValid = true;
        const newErrors = { ...errors };

        if (!product.description) {
            newErrors.description = "Product Name is required";
            isValid = false;
        }
        if (!product.strength) {
            newErrors.strength = "Strength is required";
            isValid = false;
        }
        if (!product.pack_size) {
            newErrors.pack_size = "Pack Size is required";
            isValid = false;
        }
        if (!product.pack_uom_id) {
            newErrors.pack_uom_id = "Pack UOM is required";
            isValid = false;
        }
        if (!product.measure_id) {
            newErrors.measure_id = "Measure is required";
            isValid = false;
        }
        if (!product.product_form_id) {
            newErrors.product_form_id = "Product Form is required";
            isValid = false;
        }
        if (!product.brand_id) {
            newErrors.brand_id = "Brand is required";
            isValid = false;
        }
        if (!product.generic_id) {
            newErrors.generic_id = "Generic is required";
            isValid = false;
        }
        if (!product.short_code) {
            newErrors.short_code = "Label Code is required";
            isValid = false;
        } else if (!/^[a-zA-Z0-9]{5,15}$/.test(product.short_code)) {
            newErrors.short_code =
                "Label Code must be alphanumeric and between 5 to 15 characters.";
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            try {
                const createdProduct = await createProduct(product);
                if (createdProduct.status === 201) {
                    toast.success("you have SUCCESSFULLY added New Product");
                    handleClose();
                }
            } catch (error) {
                toast.error("Failed to Create Product");
                console.error("Failed to create product", error);
                handleClose();
            }
        }
    };

    const handleChange = (name: string, value: string | number) => {
        setProduct({ ...product, [name]: value });
    };

    const fetchGenerics = async () => {
        try {
            const keyValues = await getGenerics();
            setGeneric(keyValues);
        } catch (error) {
            console.error("Fetch Generic Data failed:", error);
        }
    };
    const fetchExistingProducts = async () => {
        try {
            const products = await getProducts();
            setExistingProducts(products as any);
        } catch (error) {
            console.error('Failed to fetch existing products', error);
        }
    };
    const fetchBrands = async () => {
        try {
            const keyValues = await getBrands();
            setBrand(keyValues);
        } catch (error) {
            console.error("Fetch Generic Data failed:", error);
        }
    };

    const fetchPackuom = async () => {
        try {
            const keyValues = await getPackUoms();
            setPackuom(keyValues);
        } catch (error) {
            console.error("Fetch Generic Data failed:", error);
        }
    };

    const fetchUom = async () => {
        try {
            const keyValues = await getUoms();
            setUom(keyValues);
        } catch (error) {
            console.error("Fetch Generic Data failed:", error);
        }
    };

    const fetchProductForm = async () => {
        try {
            const keyValues = await getProductForms();
            setProductform(keyValues);
        } catch (error) {
            console.error("Fetch Generic Data failed:", error);
        }
    };

    const handleChangeOnBlur = () => {
        const uniqueMsg = existingProducts.filter((code: any) => code?.labelCode === product?.short_code)
        if (uniqueMsg.length > 0) {
            setIsBarCodeVisible(false)
            setErrors((prevErrors) => ({
                ...prevErrors,
                short_code: "Label Code must be Unique",
            }));
        } else {
            setIsBarCodeVisible(true)
            setErrors((prevErrors) => ({
                ...prevErrors,
                short_code: "",
            }));
        }
    }

    useEffect(() => {
        fetchGenerics();
        fetchBrands();
        fetchPackuom();
        fetchUom();
        fetchProductForm();
        fetchExistingProducts();

    }, []);

    return (
        <>
            <div>
                <Form>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="productName">
                                <Form.Label>Product Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={product.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    isInvalid={!!errors.description}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="strength">
                                <Form.Label>Strength</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={product.strength}
                                    onChange={(e) => handleChange("strength", e.target.value)}
                                    isInvalid={!!errors.strength}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{errors.strength}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="shortCode">
                                <Form.Label>Label Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={product.short_code}
                                    onBlur={handleChangeOnBlur}
                                    onChange={(e) => handleChange("short_code", e.target.value)}
                                    isInvalid={!!errors.short_code}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{errors.short_code}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="packUOM">
                                <Form.Label>Pack UOM</Form.Label>
                                <SelectWithSearch
                                    options={packuom}
                                    placeholder="Select Pack UOM"
                                    onSelect={(e: any) => {
                                        setProduct({
                                            ...product,
                                            pack_uom_id: e.value
                                        })
                                    }}
                                    required
                                />
                                <span className="text-danger">{errors.pack_uom_id}</span>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="measure">
                                <Form.Label>Measure</Form.Label>
                                <SelectWithSearch
                                    options={uom}
                                    placeholder="Select Measure"
                                    onSelect={(e: any) => {
                                        setProduct({
                                            ...product,
                                            measure_id: e.value
                                        })
                                    }}
                                    required
                                />
                                <span className="text-danger">{errors.measure_id}</span>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="productForm">
                                <Form.Label>Product Form</Form.Label>
                                <SelectWithSearch
                                    options={productform}
                                    placeholder="Select Product Form"
                                    onSelect={(e: any) => {
                                        setProduct({
                                            ...product,
                                            product_form_id: e.value
                                        })
                                    }}
                                    required
                                />
                                <span className="text-danger">{errors.product_form_id}</span>                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="brand">
                                <Form.Label>Brand</Form.Label>
                                <SelectWithSearch
                                    options={brand}
                                    placeholder="Select Brand"
                                    onSelect={(e: any) => {
                                        setProduct({
                                            ...product,
                                            brand_id: e.value
                                        })
                                    }}
                                    required
                                />
                                <span className="text-danger">{errors.brand_id}</span>                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="generic">
                                <Form.Label>Generic</Form.Label>
                                <SelectWithSearch
                                    options={generic}
                                    placeholder="Select Generic"
                                    onSelect={(e: any) => {
                                        setProduct({
                                            ...product,
                                            generic_id: e.value
                                        })
                                    }}
                                    required
                                />
                                <span className="text-danger">{errors.generic_id}</span>                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="packSize">
                                <Form.Label>Pack Size</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={product.pack_size}
                                    onChange={(e) => handleChange("pack_size", e.target.value)}
                                    isInvalid={!!errors.pack_size}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{errors.pack_size}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            {isBarCodeVisible && <div>
                                <div>
                                    <BarCodeGenerator
                                        res={{
                                            codes: product.short_code,
                                            idProductName: product.description,
                                            description: product.description,
                                            strength: product.strength,
                                        }}
                                        enableDownload={true}
                                    />
                                </div>
                            </div>
                            }
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <MitteButton variant="success" onClick={handleSubmit} className="uniform-btn" icon={<FaPlusCircle />}>
                            ADD
                        </MitteButton>
                        <MitteButton className="text-white uniform-btn" variant="warning" onClick={handleClose} icon={<MdCancel />}>CANCEL</MitteButton>
                    </div>
                </Form>
            </div>
        </>
    );
};

export default AddProduct;
