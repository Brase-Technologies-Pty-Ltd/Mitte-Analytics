import { useState } from "react"
import MitteInput from "../../components/input/MittiInput"
import { FormGroup } from "react-bootstrap"
import MitteButton from "../../components/mitteButton/MitteButton"

const DownloadQrs = ({ products }: any) => {
    const [selected, setSelected] = useState<number[]>([])
    const [selectAll, setSelectAll] = useState<boolean>()
    const [selectedName, setSelectedName] = useState<number[]>([])
    const [lengthOfBarcode, setLengthOfBarcode] = useState('')
    const checkBoxHandler = (e: any) => {
        const checked = e.target.checked;
        const value = parseInt(e.target.value)
        if (checked) {
            setSelected([...selected, value])
        } else {
            setSelected((prev) => {
                return prev.filter((id) => {
                    return id !== value
                })
            })
            setSelectAll(false)
        }
    }
    const checkBoxHandlerForName = (e: any) => {
        const checked = e.target.checked;
        const value = parseInt(e.target.value)
        if (checked) {
            setSelectedName([...selectedName, value])
        } else {
            setSelectedName((prev: any) => {
                return prev.filter((id: any) => {
                    return id !== value
                })
            })
        }
    }
    const printQrCodes = () => {
        const duplicates = [];
        const duplicatesName: any = [];
        const set2 = new Set(selected.map(obj => obj));
        const nameSetting = new Set(selectedName.map(obj => obj));
        for (const obj1 of products) {
            if (set2.has(obj1?.id)) {
                duplicates.push(obj1);
            }
            if (nameSetting.has(obj1?.id)) {
                duplicatesName.push(obj1);
            }
        }

        const formatedData = duplicates?.map((item: any) => {
            return {
                description: item?.description,
                codes: item?.short_code,
                strength: item?.strength,
                productName: item?.product_form?.name,
                idProductName: duplicatesName?.some((duplicate: { short_code: string }) => duplicate.short_code === item?.short_code)
            }
        })
        localStorage.setItem("qrcodes", JSON.stringify(formatedData))
        localStorage.setItem("BarcodeWidth", JSON.stringify(lengthOfBarcode))
        window.open('/qrCodes')
    }
    const selectAllHandler = (e: any) => {
        const checked = e.target.checked;
        if (products?.length === selected?.length && !checked) {
            setSelected([])
            setSelectAll(false)
        } else {
            setSelectAll(true)
            const postId = products?.map((item: any) => {
                return item?.id
            })
            setSelected(postId)
        }
    }
    const selectAllHandlerName = () => {
        if (products?.length === selectedName?.length) {
            setSelectedName([])
        } else {
            const postId = products?.map((item: any) => {
                return item?.id
            })
            setSelectedName(postId)
        }
    }
    return (
        <>
            <div className="container-fluid d-flex flex-column" style={{ padding: "0 10px", margin: "0" }}>
                <div className="row" style={{ paddingBottom: "20px", float: "right", width: "50%" }}>
                    <MitteInput
                        label=""
                        name="Size of Barcode in mm"
                        placeholder="Size of Barcode in mm"
                        required
                        size="small"
                        value={lengthOfBarcode ?? ""}
                        onChange={(e: any) => setLengthOfBarcode(e?.target?.value)}
                        style={{ marginBottom: "5px", border: "none", borderRadius: "0", borderBottom: "2px solid #3498db" }}
                    />
                </div>
                <div className="row" style={{ paddingBottom: "20px" }}>
                    <FormGroup>
                        <div className="table-responsive" style={{ maxHeight: "calc(100vh - 290px)", overflowY: "auto" }}>
                            <table className="table table-bordered table-striped">
                                <thead className="table-primary">
                                    <tr>
                                        <th style={{ fontWeight: 600, fontSize: "16px", color: "rgba(51, 91, 165, 1)" }}>
                                            Product Name
                                        </th>
                                        <th style={{ fontWeight: 600, fontSize: "16px", color: "rgba(51, 91, 165, 1)" }}>
                                            Label Code
                                        </th>
                                        <th style={{ fontWeight: 600, fontSize: "16px", color: "rgba(51, 91, 165, 1)", textAlign: "center" }}>
                                            Print Product Names
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div className="form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={selectAll}
                                                    onChange={selectAllHandler}
                                                    id="selectAll"
                                                />
                                                <label className="form-check-label" htmlFor="selectAll">Select all</label>
                                            </div>
                                        </td>
                                        <td></td>
                                        <td style={{ textAlign: "center" }}>
                                            <div className="form-check d-inline-block">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    onChange={selectAllHandlerName}
                                                    id="printAllNames"
                                                />
                                                <label className="form-check-label" htmlFor="printAllNames">Print all product Names</label>
                                            </div>
                                        </td>
                                    </tr>

                                    {products.map((product: any, index: number) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={selected.includes(product?.id)}
                                                        value={product.id}
                                                        onChange={checkBoxHandler}
                                                        id={`product-${product.id}`}
                                                    />
                                                    <label className="form-check-label" htmlFor={`product-${product.id}`}>
                                                        {product?.description}
                                                    </label>
                                                </div>
                                            </td>
                                            <td>{product?.short_code}</td>
                                            <td style={{ textAlign: "center" }}>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={selectedName.includes(product?.id)}
                                                    value={product.id}
                                                    onChange={checkBoxHandlerForName}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </FormGroup>

                </div>
                {
                    selected?.length > 0 && <div style={{ width: "100%", display: "flex", justifyContent: "space-evenly" }}>
                        <MitteButton variant='primary' className='float-end mitte-button-primary' onClick={printQrCodes}>Print Qr Codes</MitteButton>
                    </div>
                }
            </div>
        </>
    )
}

export default DownloadQrs