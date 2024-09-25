import {createAnimation, useIonModal} from "@ionic/react";
import ModalBody from "./ModalBody";

export const useConfirmationModal = ({message, otherModalOptions, confirmCallBack, cancelCallback}) => {
    const [present, dismiss] = useIonModal(ModalBody, {
        dismiss: () => dismiss(),
        message,
        confirmCallBack,
        cancelCallback
    });

    const enterAnimation = (baseEl: any) => {
        const root = baseEl.shadowRoot;
        const backdropAnimation = createAnimation()
            .addElement(root.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(root.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' }
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    const modalOptions = {
        enterAnimation,
        leaveAnimation,

        ...otherModalOptions
    };

    return { present, modalOptions }
}