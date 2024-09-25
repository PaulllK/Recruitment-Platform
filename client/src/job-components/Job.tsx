import React, {memo, useContext, useEffect, useRef, useState} from 'react';
import {
    IonImg,
    IonItem,
    IonLabel,
    createAnimation,
    useIonViewDidEnter,
    useIonViewWillEnter,
    IonIcon, IonText, IonButton, IonCardHeader, IonCard, IonCardSubtitle, IonCardTitle, IonCardContent, IonBadge
} from '@ionic/react';
import { getLogger } from '../core';
import { JobProps } from './JobProps';
import {business, logOut, people, school, sendOutline} from "ionicons/icons";
import {AuthContext} from "../auth";
import {EMPLOYER, WORKER} from "../core/constants";
import {jwtDecode} from "jwt-decode";
import {ApplicationsContext} from "./applications/ApplicationsProvider";
import app from "../App";

const log = getLogger('Job');

interface JobPropsExt extends JobProps {
  onClick: (id?: string) => void;
}

const Job: React.FC<JobPropsExt> = ({ _id, title, employerName, salaryPerHour, photoBase64, onClick }) => {

    // const jobItemRef = useRef<HTMLIonItemElement>(null);
    const { userType, token } = useContext(AuthContext);
    const { applications } = useContext(ApplicationsContext);

    const [numberOfCandidates, setNumberOfCandidates] = useState(0);

    // const growKeyframes = [
    //     { offset: 0, transform: 'scale(1)', opacity: '1' },
    //     { offset: 0.2, transform: 'scale(1.1)', opacity: '0.5' }
    // ]

    // const mouseEnterAnimation = () => {
    //     if(jobItemRef.current !== null) {
    //         const animation = createAnimation()
    //             .addElement(jobItemRef.current)
    //             .duration(1000)
    //             .keyframes(growKeyframes);
    //
    //         animation.play();
    //     }
    // };

    useEffect(() => {
        log('useEffect - applications');
        const applicationsForThisJob = applications?.filter(a => a.jobId === _id);
        setNumberOfCandidates(applicationsForThisJob !== undefined ? applicationsForThisJob.length : 0);
    }, [applications]);

    return (
        <IonCard button={true} className="w-full bg-gray-700 rounded-lg shadow-md m-2 p-2"  onClick={ () => onClick(_id) }>
            <IonCardHeader>
                <IonCardTitle>{title}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <div className="flex items-center text-sm mb-2">
                    <IonIcon icon={business} className="mr-1 text-lg align-middle" />
                    <IonLabel>{employerName}</IonLabel>
                </div>
                <div className="flex justify-between items-center">
                    <IonBadge color="success" className="font-bold bg-green-500">{salaryPerHour}RON/hour</IonBadge>
                    <div className="flex items-center">
                        <IonIcon icon={people} className="mr-1 text-lg align-middle" />
                        <IonLabel className="text-sm">{numberOfCandidates} candidate(s)</IonLabel>
                    </div>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default memo(Job);
