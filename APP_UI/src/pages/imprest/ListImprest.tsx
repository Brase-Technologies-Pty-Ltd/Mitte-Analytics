import { useEffect, useState } from 'react'
import MitteButton from '../../components/mitteButton/MitteButton'
import MitteDataTable from '../../components/smartDataTable/MitteDataTable'
import { FaEdit, FaPlusCircle, FaTrashAlt } from 'react-icons/fa'
import { getImprests, deleteOneImprest } from '../../services/imprestService'
import { Imprest } from '../../models/imprest.model'
import { ColumnDef } from '@tanstack/react-table'
import { FaCamera } from "react-icons/fa";
import EditImprest from './EditImprest';
import MitteModal from '../../components/mitte-Modal/MitteModel'
import { toast } from 'react-toastify'
import AddImprest from './AddImprest'
import AssignCamera from './AssignCamera'


interface CustomColumnMeta {
    sortable?: boolean;
    className?: string;
}

type CustomColumnDef<TData> = ColumnDef<TData, any> & {
    meta?: CustomColumnMeta;
};

const ListImprest = () => {
    const [imprests, setImprests] = useState<Imprest[]>([]);
    const [openImprestModal] = useState<boolean>(false);
    const [selectedImprest, setSelectedImprest] = useState<Imprest | null>(null);
    const [openEditModel, setOpenEditModel] = useState<boolean>(false);
    const [openAddModel, setOpenAddModal] = useState<boolean>(false);
    const [openCameraModal, setOpenCameraModal] = useState<boolean>(false);

    useEffect(() => {
        if (!openImprestModal) {
            fetchImprest();
        }
    }, [openImprestModal, openEditModel, openAddModel]);

    const fetchImprest = async () => {
        try {
            const Imprest = await getImprests();
            if (Imprest) {
                setImprests(Imprest);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const deleteImprest = async (id: any) => {
        try {
            await deleteOneImprest(id);
            toast.success("you have DELETED selected Imprest !!!");
            fetchImprest();
        } catch (error) {
            toast.error("User assigned to imprest can't delete")
        }
    };

    const handleAssignCamera = (imprest: any) => {
        setSelectedImprest(imprest);
        setOpenCameraModal(true);
        fetchImprest()
    };

    const imprestData: CustomColumnDef<any>[] = [
        {
            accessorKey: 'name',
            cell: ({ row }) => {
                return <span>{row?.original?.name}</span>;
            },
            header: () => 'Name',
            meta: { className: 'center' },
            filterFn: 'includesString',
        },
        {
            accessorKey: 'serialNo',
            cell: ({ row }) => {
                return <span>{row?.original?.serialNo}</span>;
            },
            header: () => 'Code',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'description',
            cell: ({ row }) => {
                return <span>{row?.original?.description}</span>;
            },
            header: () => 'Description',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'active',
            cell: ({ row }) => {
                return <span className={row?.original?.active === true ? ' px-3 py-1 border rounded-pill chip-success' : ' px-3 py-1 border rounded-pill chip-danger'}>{row?.original?.active === true ? 'Active' : 'Inactive'}</span>;
            },
            header: () => 'Status',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'actions',
            cell: ({ row }) => (
                <span>
                    <FaEdit style={{ cursor: 'pointer', color: 'blue' }}
                        onClick={() => { setSelectedImprest(row.original); setOpenEditModel(true) }}
                    />
                    <FaTrashAlt style={{ cursor: 'pointer', color: 'red', marginLeft: '10px' }} onClick={() => deleteImprest(row.original.id)} />
                </span>
            ),
            header: 'Actions',
            meta: {
                className: 'center',
            },
        },
        {
            accessorKey: 'cameraactions',
            cell: ({ row }) => (
                <span>
                    <FaCamera style={{ cursor: 'pointer', color: 'blue' }}
                        onClick={() => handleAssignCamera(row.original)}

                    />
                </span>
            ),
            header: () => 'Cameras',
            meta: { className: 'center' },
        },
    ];


    useEffect(() => {
        fetchImprest();
    }, [openImprestModal, openEditModel, openAddModel]);
    return (
        <>
            <div className='container-fluid'>
                <div className='row d-flex justify-content-between mb-3'>
                    <div className='col'><h4 className='text-muted'>Imprests</h4></div>
                    <div className='col'><MitteButton icon={<FaPlusCircle />} variant='primary' className='float-end mitte-button-primary' onClick={() => setOpenAddModal(true)}>ADD Imprest</MitteButton></div>

                </div>
                <MitteDataTable
                    data={imprests}
                    className='table table-striped'
                    totalRows={imprests?.length}
                    hidePagination={false}
                    columns={imprestData}
                />
            </div>
            {
                openEditModel && (
                    <MitteModal
                        onClose={() => setOpenEditModel(false)}
                        show={openEditModel}
                        headerText="EDIT IMPREST"
                        size='lg'
                        handleHeaderBtn={() => setOpenEditModel(false)}
                        modalBodyComponent={<EditImprest imprest={selectedImprest} handleClose={() => setOpenEditModel(false)} />}
                    />
                )
            }
            {
                openAddModel && (
                    <MitteModal
                        onClose={() => setOpenAddModal(false)}
                        show={openAddModel}
                        headerText="ADD IMPREST"
                        size='lg'
                        handleHeaderBtn={() => setOpenAddModal(false)}
                        modalBodyComponent={<AddImprest handleClose={() => setOpenAddModal(false)} imprest={imprests} />}
                    />
                )
            }
            {
                openCameraModal && (
                    <MitteModal
                        onClose={() => setOpenCameraModal(false)}
                        show={openCameraModal}
                        headerText={`Assign Camera for ${selectedImprest?.name}`}
                        size='lg'
                        handleHeaderBtn={() => setOpenCameraModal(false)}
                        modalBodyComponent={<AssignCamera handleClose={() => {
                            setOpenCameraModal(false)
                            fetchImprest()
                        }} imprests={imprests} id={selectedImprest?.id} />}
                    />
                )
            }
        </>
    )
}

export default ListImprest
