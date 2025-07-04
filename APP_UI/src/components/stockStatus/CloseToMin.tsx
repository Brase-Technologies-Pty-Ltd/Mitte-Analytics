import { useEffect, useState } from "react";
import { getImprestProduct } from "../../services/imprestProductsService";
import MitteDataTable from "../smartDataTable/MitteDataTable";
import { ColumnDef } from '@tanstack/react-table';


interface outOfStockListProps {
    onClose: () => void;
    imprestId: any
}
interface CustomColumnMeta {
    sortable?: boolean;
    className?: string;
}

type CustomColumnDef<TData> = ColumnDef<TData, any> & {
    meta?: CustomColumnMeta;
};
const CloseToMinList: React.FC<outOfStockListProps> = ({ imprestId }: any) => {
    const [closeToMinStock, setCloseToMinStock] = useState<any>([]);


    const [loading, setLoading] = useState<boolean>(true);


    const fetchAvailableStock = async () => {
        try {
            const ImprestProducts = await getImprestProduct();
            const filteredProducts = ImprestProducts.filter(
                (product: { imprest_id: any; }) => product.imprest_id == imprestId
            );
            // let threshold = 5;
            const threshold = 5;

            const closeToMinStockList = filteredProducts.filter(
                (product: any) =>
                    product.min_stock <= product.available_stock &&
                    product.available_stock <= product.min_stock + threshold
            );

            setCloseToMinStock(closeToMinStockList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };
    const closeToMinData: CustomColumnDef<any>[] = [
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
            accessorKey: 'min_stock',
            cell: ({ row }) => {
                return <span>{row?.original?.min_stock}</span>;
            },
            header: () => 'Min Stock',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'max_stock',
            cell: ({ row }) => {
                return <span>{row?.original?.max_stock}</span>;
            },
            header: () => 'Max Stock',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'available_stock',
            cell: ({ row }) => {
                return <span>{row?.original?.available_stock}</span>;
            },
            header: () => 'Availablestock',
            meta: { className: 'center' },
        }
    ];
    useEffect(() => {
        fetchAvailableStock();
    }, []);
    
    return (
        <>
            {
                loading ? (
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>) : <>
                    <div className="" style={{ padding: "15px" }}>
                        <MitteDataTable
                            data={closeToMinStock}
                            className='table table-striped'
                            totalRows={closeToMinStock?.length}
                            hidePagination={false}
                            columns={closeToMinData?.filter((cell) => {
                                return cell.id !== "actions";
                            })}
                        />
                    </div>
                </>
            }

        </>
    )
}

export default CloseToMinList