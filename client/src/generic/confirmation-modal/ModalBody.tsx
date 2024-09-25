import CustomButton from "../buttons/CustomButton";
import React from "react";

export interface CustomModalProps {
    dismiss: () => void;
    message: string;
    confirmCallBack?: () => void;
    cancelCallback?: () => void;
}

const ModalBody: React.FC<CustomModalProps> = ({dismiss, message, confirmCallBack, cancelCallback}) => {
    return (
        <div className="my-auto flex flex-col align-middle justify-between">
            <p className="flex justify-center mb-2">{message !== undefined ? message: "Confirm"}</p>
            <div className="mt-2 mx-auto">
                <CustomButton className="w-16 mx-1" onClick={ () => { dismiss(); confirmCallBack && confirmCallBack(); } }>
                    Yes
                </CustomButton>
                <CustomButton className="w-16 mx-1" onClick={ () => { dismiss(); cancelCallback && cancelCallback(); } }>
                    No
                </CustomButton>
            </div>
        </div>
    );
}

export default ModalBody;