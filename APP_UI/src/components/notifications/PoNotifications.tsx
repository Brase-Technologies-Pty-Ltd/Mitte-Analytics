import MitteDataTable from "../smartDataTable/MitteDataTable";
import { ColumnDef } from '@tanstack/react-table';
import { IoMdDownload } from "react-icons/io";
import { toast } from "react-toastify";
import axiosInstance from "../../middlewares/axiosInstance";


interface PoTableProps {
    poType: string | null;
    onClose: () => void;
    data?: any;
    imprestId?: any;
}
interface CustomColumnMeta {
    sortable?: boolean;
    className?: string;
}

type CustomColumnDef<TData> = ColumnDef<TData, any> & {
    meta?: CustomColumnMeta;
};
const PoStatusTable: React.FC<PoTableProps> = ({
    poType,
    data,
    imprestId,
}) => {
    const filteredData = data.filter((item: any) => {
        if (poType && imprestId) {
            return item[poType] && item.imprest_id == imprestId;
        } else if (poType) {
            return item[poType];
        } else if (imprestId) {
            return item.imprest_id == imprestId;
        }
        return true;
    });
    const handleDownload = async (id: number) => {
        try {
            const response = await axiosInstance.get(`/purchase/pos/${id}`, {
                responseType: "blob",
            });
            if (response.status !== 200) {
                toast.info(response.data.message);
            }


            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));

            const link = document.createElement("a");
            link.href = blobUrl;
            link.setAttribute("download", `${id}.txt`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    const notificationsColumns: CustomColumnDef<any>[] = [
        {
            accessorKey: 'purchaseOrderId',
            cell: ({ row }) => {
                return <span>{row?.original?.purchaseOrderId}</span>;
            },
            header: () => 'Order No',
            meta: { className: 'center' },
            filterFn: 'includesString',
        },
        {
            accessorKey: 'Product.description',
            cell: ({ row }) => {
                return <span>{row?.original?.Product.description}</span>;
            },
            header: () => 'Product Name',
            meta: { className: 'center' },
            filterFn: 'includesString',
        },
        {
            accessorKey: 'imprest.name',
            cell: ({ row }) => {
                return <span>{row?.original?.imprest.name}</span>;
            },
            header: () => 'Imprest Name',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'createdAt',
            cell: ({ row }) => {
                return <span>{row?.original?.createdAt}</span>;
            },
            header: () => {
                if (poType === 'received') return 'Approved Date';
                if (poType === 'shipped') return 'Shipped Date';
                if (poType === 'delivered') return 'Complete Date';
                return 'Initiate Date';
            },
            meta: { className: 'center' },
        },
        {
            accessorKey: 'download',
            cell: ({ row }) => {
                return <><IoMdDownload onClick={() => handleDownload(row.original.purchaseOrderId)} /></>
            },
            header: () => 'Download',
            meta: { className: 'center cursor-pointer' },
        }
    ];
    return (
        <>
            <div className="" style={{ padding: "15px" }}>
                <MitteDataTable
                    data={filteredData}
                    className='table table-striped'
                    totalRows={filteredData?.length}
                    hidePagination={false}
                    columns={notificationsColumns}
                />
            </div>
        </>
    )
}

export default PoStatusTable