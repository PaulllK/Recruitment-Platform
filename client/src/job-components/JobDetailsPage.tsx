import React, {useCallback, useContext, useEffect, useState} from "react";
import {RouteComponentProps} from "react-router";
import {JobsContext} from "./JobsProvider";
import {getLogger} from "../core";
import {JobProps} from "./JobProps";
import {
    IonButton, IonButtons, IonCol,
    IonContent, IonFab, IonGrid,
    IonHeader, IonItem, IonLabel, IonList, IonModal,
    IonPage, IonRow,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import CustomButton from "../generic/buttons/CustomButton";
import {createOutline, sendOutline, trashOutline} from "ionicons/icons";
import {AuthContext} from "../auth";
import {ACCEPTED, ADD, EMPLOYER, PENDING, UPDATE, WORKER} from "../core/constants";
import {ApplicationsContext} from "./applications/ApplicationsProvider";
import {jwtDecode} from "jwt-decode";
import {ApplicationProps} from "./applications/ApplicationProps";
import {useConfirmationModal} from "../generic/confirmation-modal/useConfirmationModal";

const log = getLogger('JobDetailsPage');

interface JobDetailsPageProps extends RouteComponentProps<{
    id?: string;
}> {}

const JobDetailsPage: React.FC<JobDetailsPageProps> = ({ history, match}) => {
    const { jobs } = useContext(JobsContext);
    const { saveApplication, deleteApplication, applications } = useContext(ApplicationsContext);
    const { token, userType, workers} = useContext(AuthContext);

    const [job, setJob] = useState<JobProps>();
    const [application, setApplication] = useState<ApplicationProps>();
    const [applicationToReject, setApplicationToReject] = useState<ApplicationProps>();

    const [alreadyApplied, setAlreadyApplied] = useState(false);
    const [numberOfCandidates, setNumberOfCandidates] = useState(0);
    const [applicationsForThisJob, setApplicationsForThisJob] = useState<ApplicationProps[]>([]);
    const [numberOfFilledPositions, setNumberOfFilledPositions] = useState(0);

    const [showModal, setShowModal] = useState(false);

    const { present: presentCancelModal, modalOptions: cancelModalOptions } = useConfirmationModal(
        {
            message: "Are you sure you want to cancel the application?",
            confirmCallBack: () => handleDeleteApplication(application)
        }
    );

    const { present: presentRejectModal, modalOptions: rejectModalOptions } = useConfirmationModal(
        {
            message: "Are you sure you want to reject this application?",
            confirmCallBack: () => handleDeleteApplication(applicationToReject)
        }
    );

    useEffect(() => {
        log('useEffect - jobs');
        const routeId = match.params.id || '';
        const currentJob = jobs?.find(j => j._id === routeId);
        if (currentJob) {
            setJob(currentJob);
        }
    }, [match.params.id, jobs]);

    useEffect(() => {
        log('useEffect - applications');
        const routeId = match.params.id || '';

        const applicationsForThisJob = applications?.filter(a => a.jobId === routeId);

        setApplicationsForThisJob(applicationsForThisJob !== undefined ? applicationsForThisJob : []);
        setNumberOfCandidates(applicationsForThisJob !== undefined ? applicationsForThisJob.length : 0);

        setNumberOfFilledPositions(
            applicationsForThisJob !== undefined ?
            applicationsForThisJob.reduce((acc, a) => a.status === ACCEPTED ? ++acc : acc, 0)
            : 0
        );

        if (userType === WORKER) {
            const currentWorkerApplicationForThisJob = applicationsForThisJob?.find(
                a => a.workerId === jwtDecode(token)._id
            );

            setApplication(currentWorkerApplicationForThisJob);

            if (currentWorkerApplicationForThisJob) {
                setAlreadyApplied(true);
            }
            else setAlreadyApplied(false);
        }
    }, [match.params.id, applications]);

    const findWorker = useCallback((userId: string) => {
        return workers?.find(w => w._id === userId);
    }, [workers]);

    const handleDeleteApplication = useCallback((application: ApplicationProps) => {
        console.log("trying to delete");
        deleteApplication(application);
    }, [application, deleteApplication]);

    const handleSaveApplication = useCallback((a?: ApplicationProps) => {
        console.log("trying to update");
        if (userType === WORKER)
            saveApplication( { jobId: job?._id, workerId: jwtDecode(token)._id, status: PENDING }, ADD );
        else // update application so that it is accepted
            saveApplication(a, UPDATE);
    }, [userType, token, job, saveApplication]);

    const handleRejectApplication = useCallback((a: ApplicationProps) => {
        setApplicationToReject(a);
        presentRejectModal(rejectModalOptions);
    }, [handleDeleteApplication]);

    return (
        <IonPage>
            <IonContent fullscreen className="bg-gray-900 text-gray-200">
                <IonGrid className="m-5">
                    <IonRow>
                        <IonCol size="12">
                            <h1 className="text-4xl font-bold text-white">{job?.title}</h1>
                            <h2 className="text-2xl mt-2 text-gray-300">{job?.employerName}</h2>
                            {
                                userType === WORKER && application ?
                                <h3 className={application?.status === ACCEPTED ? "text-green-600" : "text-orange-300"}>
                                    {"APPLICATION "}
                                    {
                                        application?.status.toUpperCase()
                                    }
                                </h3>
                                :
                                <></>
                            }
                        </IonCol>
                    </IonRow>
                    {
                        userType === EMPLOYER ?
                            <IonRow>
                                <CustomButton onClick={() => setShowModal(true)}>See applications</CustomButton>
                                <IonModal
                                    isOpen={showModal}
                                    onDidDismiss={() => setShowModal(false)}
                                    breakpoints={[0, 0.25, 0.5, 0.75]}
                                    initialBreakpoint={0.85}
                                    backdropBreakpoint={0.2}
                                    backdrop={0.9}
                                >
                                    <IonContent>
                                        <IonHeader className="mt-5">
                                            <IonToolbar>
                                                <IonTitle>
                                                    Applications for this job
                                                </IonTitle>
                                                <IonButtons slot="end">
                                                    <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
                                                </IonButtons>
                                            </IonToolbar>
                                        </IonHeader>
                                        <IonList>
                                            {applicationsForThisJob.map(a => {
                                                const currentWorker = findWorker(a.workerId);
                                                return (
                                                    <IonItem /* key={a.id} */>
                                                        <IonLabel>
                                                            <h2 className="text-xl font-bold">{currentWorker?.lastName + " " + currentWorker?.firstName}</h2>
                                                            <p className="text-sm text-gray-400">
                                                                Phone: <span className="font-medium text-white">{currentWorker?.phoneNumber}</span>
                                                            </p>
                                                            <p className="text-sm">
                                                                Status:
                                                                <span className={a.status === ACCEPTED ? "text-green-600 font-medium" : "font-medium"}> {a.status}</span>
                                                            </p>
                                                        </IonLabel>
                                                        {
                                                            a.status === ACCEPTED ?
                                                            <IonButton color="warning" onClick={() => {handleSaveApplication({...a, status: PENDING})}}>Revert to pending</IonButton>
                                                            :
                                                            <>
                                                                <IonButton color="success" disabled={job?.numberOfAvailablePositions === numberOfFilledPositions} onClick={() => handleSaveApplication({...a, status: ACCEPTED})}>Accept</IonButton>
                                                                <IonButton color="danger" onClick={() => handleRejectApplication(a)}>Reject</IonButton>
                                                            </>
                                                        }
                                                    </IonItem>
                                                )
                                            })}
                                        </IonList>
                                    </IonContent>
                                </IonModal>
                            </IonRow>
                            :
                            <></>
                    }
                    <IonRow className="mt-4">
                        <IonCol size="12">
                            <p className="text-lg"><strong className="text-white">Salary: </strong>{job?.salaryPerHour}RON/hour</p>
                            <p className="text-lg"><strong className="text-white">{numberOfCandidates}</strong> candidate(s)</p>
                            {
                                numberOfFilledPositions === job?.numberOfAvailablePositions ?
                                <p className="text-lg text-orange-300">
                                    POSITIONS FILLED
                                </p>
                                :
                                <p className="text-lg"><strong className="text-white">{numberOfFilledPositions}/{job?.numberOfAvailablePositions}</strong> position(s) filled</p>
                            }
                            <p className="mt-4 text-gray-400">{job?.description}</p>
                        </IonCol>
                    </IonRow>
                </IonGrid>
                {
                    userType &&
                    <IonFab className="mb-3" vertical="bottom" horizontal="center" slot="fixed">
                        {
                            userType === WORKER ?
                            <CustomButton
                                disabled={!alreadyApplied && job?.numberOfAvailablePositions === numberOfFilledPositions}
                                icon={alreadyApplied ? trashOutline : sendOutline}
                                color={alreadyApplied ? "danger" : undefined}
                                onClick={
                                    alreadyApplied === false ?
                                    () => handleSaveApplication()
                                    :
                                    () => presentCancelModal(cancelModalOptions) // delete application
                                }
                            >
                                {
                                    alreadyApplied ?
                                    "Cancel application"
                                    :
                                    "Apply for this job"
                                }
                            </CustomButton>
                            : // else user is an employer
                            <CustomButton icon={createOutline} onClick={() => history.push(`/job/edit/${job?._id}`)}>
                                Edit this job
                            </CustomButton>
                        }
                    </IonFab>
                }
            </IonContent>
        </IonPage>
    );
}

export default JobDetailsPage;