import { useEffect, useState } from 'react';
import { deleteOneCamera, getCameras } from '../../services/cameraService';
import { Camera } from '../../models/camera.model';
import MitteDataTable from '../../components/smartDataTable/MitteDataTable';
import { ColumnDef } from '@tanstack/react-table';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import MitteButton from '../../components/mitteButton/MitteButton';
import { FaPlusCircle } from "react-icons/fa";
import EditCamera from './EditCamera';
import MitteModal from '../../components/mitte-Modal/MitteModel';
import { toast } from 'react-toastify';
import AddCamera from './AddCamera';

interface CustomColumnMeta {
    sortable?: boolean;
    className?: string;
}

type CustomColumnDef<TData> = ColumnDef<TData, any> & {
    meta?: CustomColumnMeta;
};

const ListCamera = () => {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [openCameraModal] = useState<boolean>(false);
    const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
    const [openEditModel, setOpenEditModel] = useState<boolean>(false);
    const [openAddModel, setOpenAddModal] = useState<boolean>(false);

    useEffect(() => {
        if (!openCameraModal) {
            fetchCameras();
        }
    }, [openCameraModal, openEditModel, openAddModel]);

    const fetchCameras = async () => {
        try {
            const cameraList = await getCameras();
            if (cameraList) {
                setCameras(cameraList);
            }
        } catch (error) {
            console.error("Error fetching cameras:", error);
        }
    };

    const deleteCamera = async (id: any) => {
        try {
            const response = await deleteOneCamera(id);
            toast.success(response.message);
            fetchCameras();
        } catch (error) {
            console.error(error);
        }
    };

    const cameraColumns: CustomColumnDef<Camera>[] = [
        {
            accessorKey: 'camera_name',
            cell: ({ row }) => <span>{row.original.camera_name}</span>,
            header: () => 'Camera Name',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'serial_number',
            cell: ({ row }) => <span>{row.original.serial_number}</span>,
            header: () => 'Serial Number',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'model',
            cell: ({ row }) => <span>{row.original.model}</span>,
            header: () => 'Model',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'url',
            cell: ({ row }) => {
                const rawUrl = String(row.original.url || '');
                const href = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
                    ? rawUrl
                    : `https://${rawUrl}`;

                return (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                        {rawUrl}
                    </a>
                );
            },
            header: () => 'URL',
            meta: { className: 'center' },
        },

        {
            accessorKey: 'active',
            cell: ({ row }) => {
                const status = row.original.active?.toString() === 'true';
                return (
                    <span className={status ? 'px-3 py-1 border rounded-pill chip-success' : 'px-3 py-1 border rounded-pill chip-danger'}>
                        {status ? 'Active' : 'Inactive'}
                    </span>
                );
            },
            header: () => 'Status',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'actions',
            cell: ({ row }) => (
                <span>
                    <FaEdit style={{ cursor: 'pointer', color: 'blue' }} onClick={() => { setSelectedCamera(row.original); setOpenEditModel(true) }} />
                    <FaTrashAlt style={{ cursor: 'pointer', color: 'red', marginLeft: '10px' }} onClick={() => deleteCamera(row.original.id)} />
                </span>
            ),
            header: 'Actions',
            meta: { className: 'center' },
        }
    ];

    return (
        <>
            <div className='container-fluid'>
                <div className='row d-flex justify-content-between mb-3'>
                    <div className='col'><h4 className='text-muted'>Cameras</h4></div>
                    <div className='col'>
                        <MitteButton icon={<FaPlusCircle />} variant='primary' className='float-end mitte-button-primary' onClick={() => setOpenAddModal(true)}>
                            ADD CAMERA
                        </MitteButton>
                    </div>
                </div>
                <MitteDataTable
                    data={cameras}
                    className='table table-striped'
                    totalRows={cameras.length}
                    hidePagination={false}
                    columns={cameraColumns}
                />
            </div>
            {openEditModel && (
                <MitteModal
                    onClose={() => setOpenEditModel(false)}
                    show={openEditModel}
                    headerText="EDIT CAMERA"
                    size='lg'
                    handleHeaderBtn={() => setOpenEditModel(false)}
                    modalBodyComponent={<EditCamera camera={selectedCamera} onClose={() => setOpenEditModel(false)} />}
                />
            )
            }
            {
                openAddModel && (
                    <MitteModal
                        onClose={() => setOpenAddModal(false)}
                        show={openAddModel}
                        headerText="ADD CAMERA"
                        size='lg'
                        handleHeaderBtn={() => setOpenAddModal(false)}
                        modalBodyComponent={<AddCamera handleClose={() => setOpenAddModal(false)} camera={cameras} />}

                    />
                )
            }
        </>

    );
};

export default ListCamera;