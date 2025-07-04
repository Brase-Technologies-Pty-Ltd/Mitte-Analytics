import { useEffect, useState } from 'react';
import { getRoles, deleteRole } from '../../services/role.svc';
import { Role } from '../../models/role.model';
import MitteDataTable from '../../components/smartDataTable/MitteDataTable';
import { ColumnDef } from '@tanstack/react-table';
import { FaEdit, FaTrashAlt, FaPlusCircle } from 'react-icons/fa';
import MitteButton from '../../components/mitteButton/MitteButton';
import MitteModal from '../../components/mitte-Modal/MitteModel';
import AddRole from './AddRole';
import EditRole from './EditRole';
import { toast } from 'react-toastify';

interface CustomColumnMeta {
    sortable?: boolean;
    className?: string;
}

type CustomColumnDef<TData> = ColumnDef<TData, any> & {
    meta?: CustomColumnMeta;
};

const RoleList = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [openroleModal] = useState<boolean>(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [openEditModel, setOpenEditModel] = useState<boolean>(false);
    const [openAddModel, setOpenAddModel] = useState<boolean>(false);

    useEffect(() => {
        if (!openroleModal) {
            fetchRoles();
        }
    }, [openroleModal, openEditModel, openAddModel]);

    const fetchRoles = async () => {
        try {
            const roleList = await getRoles();
            console.log(roleList, "roleList");
            if (roleList) {
                setRoles(roleList);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const deleteOneRole = async (id: any) => {
        try {
            await deleteRole(id);
            toast.success("you have DELETED selected Role !!!");
            fetchRoles();
        } catch (error) {
            console.error(error);
            toast.error("Unable to delete role as it is associated with users");
        }
    };

    const roleColumns: CustomColumnDef<Role>[] = [
        {
            accessorKey: 'name',
            cell: ({ row }) => <span>{row.original.name}</span>,
            header: () => 'Role Name',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'description',
            cell: ({ row }) => <span>{row.original.description}</span>,
            header: () => 'Description',
            meta: { className: 'center' },
        },
        {
            accessorKey: 'actions',
            cell: ({ row }) => (
                <span>
                    <FaEdit style={{ cursor: 'pointer', color: 'blue' }} onClick={() => { setSelectedRole(row.original); setOpenEditModel(true); }} />
                    <FaTrashAlt style={{ cursor: 'pointer', color: 'red', marginLeft: '10px' }} onClick={() => deleteOneRole(row.original.id)} />
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
                    <div className='col'>
                        <h4 className='text-muted'>Roles</h4>
                    </div>
                    <div className='col'>
                        <MitteButton
                            icon={<FaPlusCircle />}
                            variant='primary'
                            className='float-end mitte-button-primary'
                            onClick={() => setOpenAddModel(true)}
                        >
                            ADD ROLE
                        </MitteButton>
                    </div>
                </div>
                <MitteDataTable
                    data={roles}
                    className='table table-striped'
                    totalRows={roles.length}
                    hidePagination={false}
                    columns={roleColumns}
                />
            </div>

            {openEditModel && selectedRole && (
                <MitteModal
                    onClose={() => setOpenEditModel(false)}
                    show={openEditModel}
                    headerText="EDIT ROLE"
                    size='lg'
                    handleHeaderBtn={() => setOpenEditModel(false)}
                    modalBodyComponent={<EditRole role={selectedRole} handleclose={() => setOpenEditModel(false)} />}
                />
            )}

            <MitteModal
                onClose={() => setOpenAddModel(false)}
                show={openAddModel}
                headerText="ADD ROLE"
                size='lg'
                handleHeaderBtn={() => setOpenAddModel(false)}
                modalBodyComponent={<AddRole handleclose={() => setOpenAddModel(false)} />}
            />

        </>
    );
};

export default RoleList;
