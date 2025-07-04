import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { getCameras } from "../../services/cameraService";
import { getImprestById, updateImprest } from "../../services/imprestService";
import MitteDataTable from "../../components/smartDataTable/MitteDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";

interface CustomColumnMeta {
    sortable?: boolean;
    className?: string;
}

type CustomColumnDef<TData> = ColumnDef<TData, any> & {
    meta?: CustomColumnMeta;
};

const AssignCamera = ({ id, handleClose, imprests }: any) => {
    const [cameras, setCameras] = useState<any[]>([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const imprestId = id ?? -1;

    useEffect(() => {
        fetchData();
    }, [imprestId]);

    const fetchData = async () => {
        try {
            const allCameras = await getCameras();
            const activeCameras = allCameras.filter((c: any) => c.active === "true");

            const currentImprest = await getImprestById(imprestId);

            const currentAssignedCameraNames = currentImprest?.cameras
                ?.split(",")
                .map((name: string) => name.trim()) ?? [];

            const otherAssignedCameraNames: string[] = [];

            imprests.forEach((imp: any) => {
                if (imp.id !== imprestId && typeof imp.cameras === "string") {
                    imp.cameras
                        .split(",")
                        .map((name: string) => name.trim())
                        .filter(Boolean)
                        .forEach((name: string) => {
                            if (!otherAssignedCameraNames.includes(name)) {
                                otherAssignedCameraNames.push(name);
                            }
                        });
                }
            });

            const enrichedCameras = activeCameras.map((camera: any) => ({
                ...camera,
                isAssignedToThis: currentAssignedCameraNames.includes(camera.camera_name),
                isAssignedToOthers: otherAssignedCameraNames.includes(camera.camera_name),
            }));

            const preSelected = enrichedCameras.filter((c: any) => c.isAssignedToThis);

            setCameras(enrichedCameras);
            setSelectedRows(preSelected);
        } catch (error) {
            console.error("Data fetch failed:", error);
        }
    };

    const handleRowSelect = (e: React.ChangeEvent<HTMLInputElement>, row: any) => {
        const exists = selectedRows.find((r) => r.id === row.original.id);
        let updatedRows = [];

        if (e.target.checked && !exists) {
            updatedRows = [...selectedRows, row.original];
        } else {
            updatedRows = selectedRows.filter((r) => r.id !== row.original.id);
        }

        setSelectedRows(updatedRows);
    };

    const handleSubmit = async () => {
        try {
            const selectedCameraNames = selectedRows.map((cam) => cam.camera_name);
            const selectedCameraSerials = selectedRows.map((cam) => cam.serial_number);

            const payload = {
                cameras: selectedCameraNames.join(","),
                serial_number: selectedCameraSerials.join(","),
            };

            if (imprestId) {
                const res = await updateImprest(imprestId, payload);
                if (res) {
                    toast.success("Camera updated successfully");
                    handleClose();
                }
                else console.error("Camera update failed");
            }
        } catch (err) {
            console.error("Submit failed:", err);
        }
    };

    const columns: CustomColumnDef<any>[] = [
        {
            accessorKey: "cameraactions",
            header: "Cameras",
            cell: ({ row }) => {
                const camera = row.original;
                const isChecked = selectedRows.some((r) => r.id === camera.id);
                const isDisabled = camera.isAssignedToOthers;

                return (
                    <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={(e) => handleRowSelect(e, row)}
                    />
                );
            },
            meta: { className: "center" },
        },
        {
            accessorKey: "camera_name",
            header: () => "Camera Name",
            cell: ({ row }) => <span>{row.original.camera_name}</span>,
            meta: { className: "center" },
            filterFn: "includesString",
        },
        {
            accessorKey: "serial_number",
            header: () => "Serial Number",
            cell: ({ row }) => <span>{row.original.serial_number}</span>,
            meta: { className: "center" },
        },
        {
            accessorKey: "active",
            header: () => "Status",
            cell: ({ row }) => (
                <span
                    className={
                        row.original.active === "true"
                            ? "px-3 py-1 border rounded-pill chip-success"
                            : "px-3 py-1 border rounded-pill chip-danger"
                    }
                >
                    {row.original.active === "true" ? "Active" : "Inactive"}
                </span>
            ),
            meta: { className: "center" },
        },
    ];

    return (
        <Container>
            <Row>
                <Col>
                    <MitteDataTable
                        columns={columns}
                        data={cameras?.filter((c) => !c.isAssignedToOthers)}
                        totalRows={cameras?.filter((c) => !c.isAssignedToOthers)?.length}
                        hidePagination={false}
                    />
                </Col>
            </Row>
            <Row className="mt-4">
                <div className="d-flex justify-content-center gap-3 mt-4">
                    <button type="submit" className="btn btn-success px-4" onClick={handleSubmit}>
                        ASSIGN
                    </button>
                    <button type="button" className="btn btn-warning px-4 text-white" onClick={handleClose}>
                        CANCEL
                    </button>
                </div>
            </Row>
        </Container>
    );
};

export default AssignCamera;
