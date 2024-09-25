import React from 'react';
import { IonText } from '@ionic/react';
import {LogoutFn} from "../../auth";
import { logOut } from 'ionicons/icons';
import CustomButton from "./CustomButton";
import {useConfirmationModal} from "../confirmation-modal/useConfirmationModal";

interface LogoutModalProps {
    logoutCallback?: LogoutFn
}

export const LogoutButton: React.FC<LogoutModalProps> = ({logoutCallback}) => {

    const { present, modalOptions } = useConfirmationModal(
        {
            message: "Are you sure you want to log out?",
            confirmCallBack: logoutCallback
        }
    );

    return (
        <>
            <CustomButton icon={logOut} className="mx-2" onClick={ () => present(modalOptions) } size="small" slot="end">
                <IonText>Log out</IonText>
            </CustomButton>
        </>
    );
};
