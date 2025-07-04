
import BarCodeGenerator from './BarCodeGenerator'
import { useEffect, useRef } from 'react'

const BarCodeContainer = () => {
    const response = localStorage.getItem("qrcodes")
    const qrData = response && JSON.parse(response)
    const isFirstRender = useRef(false);
    useEffect(() => {
        if (!isFirstRender.current) {
            isFirstRender.current = true
            setTimeout(() => {
                print()
            }, 1500)
        }
    }, [qrData])
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }} >
            {qrData?.length > 0 && qrData?.map((obj: any, index: number) => (
                <BarCodeGenerator res={obj} key={index}></BarCodeGenerator>
            ))}
        </div>

    )
}

export default BarCodeContainer