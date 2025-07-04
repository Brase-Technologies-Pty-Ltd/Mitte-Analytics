import React, { useEffect, useState } from "react";
import bwipjs from 'bwip-js/browser';

import { FiDownload } from "react-icons/fi"; // Install react-icons if not already

interface BarCodeGeneratorProps {
    res: {
        codes: string;
        idProductName?: string;
        description?: string;
        strength?: string;
    };
    enableDownload?: boolean;
}

const BarCodeGenerator: React.FC<BarCodeGeneratorProps> = ({ res, enableDownload }) => {
    const [src, setImageSrc] = useState("");
    const barcodeWidthinMM = localStorage.getItem("BarcodeWidth");
    const widthValue = barcodeWidthinMM ? (JSON.parse(barcodeWidthinMM) / 25.4) * 96 : 94;

    useEffect(() => {
        const canvas = document.createElement("canvas");
        const loadComponent = async () => {
            try {
                await bwipjs.toCanvas(canvas, {
                    bcid: "datamatrix",
                    text: `${res?.codes}`,
                    scale: 3,
                    includetext: true,
                    textxalign: "center",
                });
                setImageSrc(canvas.toDataURL("image/png"));
            } catch (e) {
                console.error(e);
            }
        };
        loadComponent();
    }, []);

    const handleDownload = () => {
        if (!src) return;
        const link = document.createElement("a");
        link.href = src;
        link.download = `${res?.codes || "barcode"}.png`;
        link.click();
    };

    return (
        <div style={{
            border: "1px solid black", gap: "15px", padding: "5px",
            display: res?.idProductName ? "flex" : "block",
            width: "fit-content"
        }}>
            {/* Download Icon */}
            {enableDownload && (
                <div
                    onClick={handleDownload}
                  
                    title="Download Barcode"
                >
                    <FiDownload size={18} />
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "center" }}>
                <img src={src} width={widthValue || 94} height={widthValue || 94} />
            </div>

            {!res?.idProductName && <span style={{ textAlign: "center" }}>{res?.codes}</span>}

            {res?.idProductName && (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
                    <div>
                        <span>{res?.description}</span>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <span>{res?.strength}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: "center" }}>{res?.codes}</div>
                </div>
            )}
        </div>
    );
};

export default BarCodeGenerator;
