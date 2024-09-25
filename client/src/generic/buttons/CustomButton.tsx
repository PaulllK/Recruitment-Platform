import {IonButton, IonIcon} from "@ionic/react";
import React from "react";

export interface CustomButtonProps {
    icon?: string;
    className?: string;
    onClick: () => void;
    children: React.ReactNode;
    size?: string;
    slot?: string;
    disabled?: boolean;
    color?: string
}

const CustomButton: React.FC<CustomButtonProps> = ({disabled, color, icon, onClick, className, children, ...rest}) => {
    return (
        <IonButton disabled={disabled} color={color || "success"} className={`shadow-xl font-bold ${className}`} onClick={ () => onClick() } {...rest}>
            { icon && <IonIcon icon={icon} className="text-3xl mr-1"></IonIcon> }
            {children}
        </IonButton>
    );
}

export default CustomButton;