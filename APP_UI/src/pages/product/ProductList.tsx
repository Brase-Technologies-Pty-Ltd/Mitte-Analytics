import { useEffect, useState } from 'react';
import MitteButton from '../../components/mitteButton/MitteButton';
import { FaEdit, FaPlusCircle, FaTrashAlt } from 'react-icons/fa'
import { ColumnDef } from '@tanstack/react-table';
import MitteDataTable from '../../components/smartDataTable/MitteDataTable';
import { deleteProduct, getAllProduct } from '../../services/productService';
import MitteModal from '../../components/mitte-Modal/MitteModel';
import DownloadQrs from './DownloadQrs';
import { toast } from 'react-toastify';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';



interface CustomColumnMeta {
    sortable?: boolean;
    className?: string;
}

type CustomColumnDef<TData> = ColumnDef<TData, any> & {
    meta?: CustomColumnMeta;
};
const ProductList = () => {
    const isAdmin = () => {
        const roles: any = JSON.parse(localStorage.getItem("roles") || "[]");
        return roles?.some((role: any) => role?.name?.toLowerCase() === "admin");
    }
    const [openProductModal, setOpenProductModal] = useState<boolean>(false);
    const [editProductModal, setEditProductModal] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [downloadQrCodesModal, setOpenDownloadQrCodesModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [products, setProducts] = useState<any>([]);

    const headCells: CustomColumnDef<any>[] = [
        {
            accessorKey: 'description',
            cell: ({ row }) => {
                return <span>{row?.original?.description ?? '-'}</span>;
            },
            header: () => 'Product Name',
            meta: { className: 'center' },
            filterFn: 'includesString',
        },
        {
            accessorKey: 'generic_name.name',
            cell: ({ row }) => {
                return <span>{row?.original?.generic_name?.name ?? '-'}</span>;
            },
            header: () => 'Generic Name',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'strength',
            cell: ({ row }) => {
                return <span>{row?.original?.strength ?? '-'}</span>;
            },
            header: () => 'Strength',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'short_code',
            cell: ({ row }) => {
                return <span>{row?.original?.short_code ?? '-'}</span>;
            },
            header: () => 'Label code',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'pack_size',
            cell: ({ row }) => {
                return <span>{row?.original?.pack_size ?? '-'}</span>;
            },
            header: () => 'Pack size',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'pack_unit_of_measure.name',
            cell: ({ row }) => {
                return <span >{row?.original?.pack_unit_of_measure?.name ?? '-'}</span>;
            },
            header: () => 'Pack uom',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'unit_of_measure.name',
            cell: ({ row }) => {
                return <span >{row?.original?.unit_of_measure?.name ?? '-'}</span>;
            },
            header: () => 'UOM',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'product_form.name',
            cell: ({ row }) => {
                return <span >{row?.original?.product_form?.name ?? '-'}</span>;
            },
            header: () => 'Product Form',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'brand.name',
            cell: ({ row }) => {
                return <span >{row?.original?.brand?.name ?? '-'}</span>;
            },
            header: () => 'Brand',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'actions',
            cell: ({ row }) => {
                return <span>
                    <FaEdit style={{ cursor: 'pointer', color: 'blue' }}
                        onClick={() => {
                            handleEditProduct(row.original)
                        }}
                    />
                    <FaTrashAlt style={{ cursor: 'pointer', color: 'red', marginLeft: '10px' }} onClick={() => handleDelete(row.original.id)} />
                </span>
            },
            header: () => 'Actions',
            meta: { className: 'center' }
        }
    ];

    const handleEditProduct = (product: any) => {
        setEditProductModal(true);
        setSelectedProduct(product);
    }


    const fetchProduct = async () => {
        try {
            const res = await getAllProduct();
            if (res != null && res?.length > 0) {
                setProducts(res);
                setLoading(false)
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const handleQrCodeModalClose = () => {
        setOpenDownloadQrCodesModal(false)
    }
    const handleDelete = async (id: number) => {
        try {
            await deleteProduct(id);
            toast.success("you have DELETED selected Product !!!");
            fetchProduct();
        } catch (err) {
            toast.error("Product assigned to imprest can't delete");
        }
    };
    useEffect(() => {
        if (!openProductModal) {
            fetchProduct();
        }
    }, [openProductModal, editProductModal]);
    return (
        <>
            {
                downloadQrCodesModal &&
                <MitteModal
                    onClose={handleQrCodeModalClose}
                    show={downloadQrCodesModal}
                    headerText="Select Qr Codes to Download"
                    size='lg'
                    handleHeaderBtn={() => setOpenDownloadQrCodesModal(false)}
                    modalBodyComponent={<>
                        <DownloadQrs products={products} />
                    </>}
                />
            }
            <div className="container-fluid" style={{ padding: "0 20px", margin: "0" }}>
                <div className="row" style={{ paddingBottom: "20px" }}>
                    <div
                        className="col-sm-8"
                        style={{
                            fontFamily: "Roboto",
                            fontSize: "20px",
                            fontWeight: 900,
                            color: "#2d8925f7",
                        }}
                    >
                        Products
                    </div>
                    <div className="col-sm-4" style={{ gap: "10px", display: "flex" }}>
                        <MitteButton icon={<FaPlusCircle />} variant='primary' className='float-end mitte-button-primary' onClick={() => setOpenDownloadQrCodesModal(true)}>DOWNLOAD DM CODES</MitteButton>
                        {
                            isAdmin() &&
                            <MitteButton icon={<FaPlusCircle />} variant='primary' className='float-end mitte-button-primary' onClick={() => { setOpenProductModal(true) }}>ADD PRODUCT</MitteButton>
                        }
                    </div>
                </div>
                <div className="row">
                    {
                        loading ? (
                            <div className="d-flex justify-content-center">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>) : (<>
                                <div className="" style={{ padding: "15px" }}>
                                    <MitteDataTable
                                        data={products}
                                        className='table table-striped'
                                        totalRows={products?.length}
                                        hidePagination={false}
                                        columns={headCells?.filter((cell) => {
                                            return isAdmin() || cell.id !== "actions";
                                        })}
                                    />
                                </div>
                            </>)
                    }
                </div>
            </div>
            {
                openProductModal && (
                    <MitteModal
                        onClose={() => setOpenProductModal(false)}
                        show={openProductModal}
                        headerText="ADD PRODUCT"
                        size='lg'
                        handleHeaderBtn={() => setOpenProductModal(false)}
                        modalBodyComponent={<AddProduct handleClose={() => setOpenProductModal(false)} />}
                    />
                )
            }
            {
                editProductModal && (
                    <MitteModal
                        onClose={() => setEditProductModal(false)}
                        show={editProductModal}
                        headerText="EDIT PRODUCT"
                        size='lg'
                        handleHeaderBtn={() => setEditProductModal(false)}
                        modalBodyComponent={<EditProduct handleClose={() => setEditProductModal(false)} products={selectedProduct} />}
                    />
                )
            }
        </>
    )
}

export default ProductList