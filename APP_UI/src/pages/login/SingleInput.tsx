
import React, { memo, useRef, useLayoutEffect } from "react";
import usePrevious from "./usePrevious";

export interface SingleOTPInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    focus?: boolean;
}

export function SingleOTPInputComponent(props: SingleOTPInputProps) {
    const { focus, autoFocus, className, ...rest } = props;
    const inputRef = useRef<HTMLInputElement>(null);
    const prevFocus = usePrevious(!!focus);

    useLayoutEffect(() => {
        if (inputRef.current) {
            if (focus && autoFocus && focus !== prevFocus) {
                inputRef.current.focus();
                inputRef.current.select();
            }
        }
    }, [autoFocus, focus, prevFocus]);

    return (
        <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            autoComplete="off"
            maxLength={1}
            className={`form-control text-center mx-1 p-2 fw-bold border rounded shadow-sm ${className || ""}`}
            style={{ width: "3rem", height: "3rem" }}
            {...rest}
        />
    );
}

const SingleOTPInput = memo(SingleOTPInputComponent);
export default SingleOTPInput;
