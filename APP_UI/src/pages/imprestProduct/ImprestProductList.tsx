import { useEffect, useRef, useState } from "react";
import { getImprestProduct, getSingleImprests } from "../../services/imprestService";
import { ImprestProduct } from "../../models/imprestProduct.model";
import { ColumnDef } from '@tanstack/react-table';
import { FaEdit, FaPlusCircle, FaTrashAlt } from 'react-icons/fa';
import MitteButton from "../../components/mitteButton/MitteButton";
import MitteDataTable from "../../components/smartDataTable/MitteDataTable";
import MitteModal from "../../components/mitte-Modal/MitteModel";
import AddImprestProduct from "./AddImprestProduct";
import EditImprestProduct from "./EditImprestProduct";
import SmartConfirmAlert from "../../components/confirmAlert/SmartConfirmAlert";
import { deleteImprestProduct, restockImprestProducts } from "../../services/imprestProductService";
import { LuTimerReset } from "react-icons/lu";
import { toast } from "react-toastify";
import moment from 'moment-timezone';
import SelectWithSearch from "../../components/mitteSelectWithSearch/MitteSelectwithsearch";


interface CustomColumnMeta {
    sortable?: boolean;
    className?: string;
}

type CustomColumnDef<TData> = ColumnDef<TData, any> & {
    meta?: CustomColumnMeta;
};
const fatdAPIbaseURL = import.meta.env.VITE_APP_FAST_API_BASE_URL

const ImprestProductList = () => {

    const [imprestProduct, setImprestProduct] = useState<ImprestProduct[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [addImprestProductModal, setAddImprestProductModal] = useState<boolean>(false);
    const [editImprestProductModal, setEditImprestProductModal] = useState<boolean>(false);
    const [selectedImprestProduct, setSelectedImprestProduct] = useState<ImprestProduct | null>(null);
    const [deleteCameraModel, setDeleteCameraModel] = useState<boolean>(false);
    const [imprests, setImprests] = useState<any>([]);
    const [selectedImprest, setSelectedImprest] = useState({
        name: "",
        id: "",
        serialNo: "",
        camera_serialNo: "",
    } as any);
    const [runningStreams, setRunningStreams] = useState<string[]>([]);


    const previousDataRef = useRef<string>("");

    const columns: CustomColumnDef<any>[] = [
        {
            accessorKey: 'Product.description',
            cell: ({ row }) => <span>{row.original?.Product.description}</span>,
            header: () => 'Product Name',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'Product.strength',
            cell: ({ row }) => <span>{row.original?.Product.strength}</span>,
            header: () => 'Strength',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'imprest.name',
            cell: ({ row }) => <span>{row.original?.imprest?.name}</span>,
            header: () => 'Imprest Name',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'min_stock',
            cell: ({ row }) => <span>{row.original?.min_stock}</span>,
            header: () => 'Min Stock',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'max_stock',
            cell: ({ row }) => <span>{row.original?.max_stock}</span>,
            header: () => 'Max Stock',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'available_stock',
            cell: ({ row }) => <span>{row.original?.available_stock}</span>,
            header: () => 'Available Stock',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'actions',
            cell: ({ row }) => (
                <span>
                    <FaEdit style={{ cursor: 'pointer', color: 'blue' }}
                        onClick={() => {
                            setSelectedImprestProduct(row.original);
                            setEditImprestProductModal(true);
                        }}
                    />
                    <FaTrashAlt style={{ cursor: 'pointer', color: 'red', marginLeft: '10px' }}
                        onClick={() => {
                            setSelectedImprestProduct(row.original);
                            setDeleteCameraModel(true);
                        }} />
                </span>
            ),
            header: 'Actions',
            meta: { className: 'center' },
        },
    ];

    const handleChange = async (field: string, value: string | number) => {
        const selectedImprestOption = imprests.find(
            (option: any) => option.value === value
        );
        if (selectedImprestOption) {
            const newSelection = {
                ...selectedImprest,
                [field]: value,
                name: selectedImprestOption.label,
                serialNo: selectedImprestOption.serialNo,
                camera_serialNo: selectedImprestOption.camera_serialNo,
            };
            setSelectedImprest(newSelection);

            try {
                await fetch(`${fatdAPIbaseURL}stream/start`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ serial_number: selectedImprestOption.camera_serialNo }),
                });
            } catch (error) {
                console.warn("FastAPI /stream/start failed");
            }
        }
    };


    const fetchImprests = async () => {
        try {
            const imprestsRaw: any = await getSingleImprests();

            let runningStreamKeys: string[] = [];
            try {
                const streamRes = await fetch(`${fatdAPIbaseURL}stream/list`);
                const streamData = await streamRes.json();
                runningStreamKeys = Object.keys(streamData.running_streams || {});
            } catch (err) {
                console.warn("FastAPI /stream/list is down or unreachable");
            }

            const imprestDropdownList = imprestsRaw.map((imprest: any) => {
                const isRunning = runningStreamKeys.some((key: string) =>
                    key.split(',').includes(imprest.serial_number)
                );

                return {
                    label: imprest.name,
                    value: imprest.id?.toString() || "",
                    serialNo: imprest.serialNo,
                    camera_serialNo: imprest.serial_number,
                    isRunning,
                };
            });

            setImprests(imprestDropdownList);
        } catch (error) {
            console.error("getSingleImprests failed (this should not happen):", error);
        }
    };



    const fetchImprestProduct = async () => {
        try {
            const response = await getImprestProduct();
            const newDataString = JSON.stringify(response);
            if (newDataString !== previousDataRef.current) {
                previousDataRef.current = newDataString;
                setImprestProduct(response);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImprests();
        fetchImprestProduct(); // Initial load
        const interval = setInterval(() => {
            fetchImprestProduct(); // Refresh every 6 seconds
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`${fatdAPIbaseURL}stream/list`);
                const data = await response.json();
                const runningKeys = Object.keys(data.running_streams || []);
                setImprests((prev: any) =>
                    prev.map((imprest: any) => ({
                        ...imprest,
                        isRunning: runningKeys.some((key: string) =>
                            key.split(',').includes(imprest.camera_serialNo)
                        ),
                    }))
                );
            } catch (err) {
                console.warn("FastAPI /stream/list failed — skipping status update");
            }
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const deleteImprestProducts = async () => {
        try {
            if (!selectedImprestProduct?.id) return;
            const result = await deleteImprestProduct(selectedImprestProduct.id);
            if (result) {
                toast.success("Imprest Product deleted successfully");
                setDeleteCameraModel(false);
                fetchImprestProduct();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete product");
        }
    };

    const restockImprestProduct = async () => {
        try {
            const result = await restockImprestProducts();
            if (result?.length > 0) {
                toast.success("Restock Success");
                fetchImprestProduct();
            }
        } catch (error) {
            console.error("Error during restock:", error);
            toast.error("Error restocking Imprest Products");
        }
    };

    useEffect(() => {
        if (imprests.length > 0 && !selectedImprest.id) {
            setSelectedImprest({
                name: imprests[0].label,
                id: imprests[0].value,
            });
        }
    }, [imprests, selectedImprest]);

    return (
        <>
            <div className="container-fluid">
                <div className='row d-flex justify-content-between mb-3'>
                    <h4 className="text-muted d-flex align-items-center gap-2">
                        Imprest Products -
                        <span className="text-primary d-flex align-items-center gap-2">
                            {selectedImprest?.name}
                            {(() => {
                                const selected = imprests.find((i: any) => i.value === selectedImprest?.id);
                                return selected?.isRunning ? (
                                    <span className="live-ripple">
                                        <span className="pulse-circle"></span>
                                    </span>
                                ) : (
                                    <span className="badge bg-secondary"></span>
                                );
                            })()}
                        </span>
                    </h4>

                    <div className='col'>
                        <MitteButton
                            icon={<FaPlusCircle />}
                            onClick={() => setAddImprestProductModal(true)}
                            variant='primary'
                            className='float-end mitte-button-primary'
                        >
                            ADD IMPREST PRODUCT
                        </MitteButton>
                    </div>

                </div>

                <div className='row d-flex justify-content-space-evenly mb-3'>
                    <div className="col-sm-3">
                        <SelectWithSearch
                            options={imprests}
                            value={selectedImprest?.id}
                            onSelect={(value: any) => handleChange("id", value?.value)}
                            placeholder="Select Imprest"
                            isClearable={false}
                        />
                    </div>
                    <div className="col-sm-9 d-flex align-items-center justify-content-end">
                        <h5 className="text-muted">
                            Last Updated: {moment().tz(moment.tz.guess()).format("DD-MM-YYYY HH:mm:ss z")}
                        </h5>
                    </div>
                </div>

                {loading ? (
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <MitteDataTable
                            data={imprestProduct?.filter((item: any) => item.imprest_id == selectedImprest?.id)}
                            className='table table-striped'
                            totalRows={imprestProduct?.length}
                            hidePagination={false}
                            columns={columns}
                            noDataMessage='No Imprest Products found'
                        />
                        <div className="mt-3">
                            <MitteButton
                                onClick={restockImprestProduct}
                                variant='primary'
                                className='mitte-button-primary'
                            >
                                <LuTimerReset /> Restock
                            </MitteButton>
                        </div>
                    </>
                )}
            </div>

            {addImprestProductModal && (
                <MitteModal
                    onClose={() => setAddImprestProductModal(false)}
                    show={addImprestProductModal}
                    headerText="ADD IMPREST PRODUCT"
                    size='lg'
                    handleHeaderBtn={() => setAddImprestProductModal(false)}
                    modalBodyComponent={<AddImprestProduct handleClose={() => setAddImprestProductModal(false)} />}
                />
            )}

            {editImprestProductModal && selectedImprestProduct && (
                <MitteModal
                    onClose={() => setEditImprestProductModal(false)}
                    show={editImprestProductModal}
                    headerText="EDIT IMPREST PRODUCT"
                    size='lg'
                    handleHeaderBtn={() => setEditImprestProductModal(false)}
                    modalBodyComponent={
                        <EditImprestProduct
                            handleClose={() => setEditImprestProductModal(false)}
                            selectedImprestProduct={selectedImprestProduct}
                        />
                    }
                />
            )}

            {deleteCameraModel && (
                <SmartConfirmAlert
                    show={deleteCameraModel}
                    title="DELETE IMPREST PRODUCT"
                    message="Are you sure you want to delete this?"
                    onConfirm={deleteImprestProducts}
                    onCancel={() => setDeleteCameraModel(false)}
                />
            )}
        </>
    );
};

export default ImprestProductList;
