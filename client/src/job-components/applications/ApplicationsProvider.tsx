import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../../core';
import { ApplicationProps } from './ApplicationProps';
import {AuthContext} from "../../auth";
import {createApplication, removeApplication, getApplications, updateApplication} from "./applicationsCommunicationApi";
import {ADD, APPLICATIONS_WS_PATH, UPDATE} from "../../core/constants";
import {newWebSocket} from "../../core/web-socket";

const log = getLogger('ApplicationsProvider');

type SaveApplicationFn = (application: ApplicationProps, mode: string) => Promise<any>;
type DeleteApplicationFn = (application: ApplicationProps) => Promise<any>;
type FetchApplicationsFn = () => Promise<any>;

export interface ApplicationsState {
    applications?: ApplicationProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveApplication?: SaveApplicationFn,
    deleteApplication?: DeleteApplicationFn,
    fetchMoreApplications?: FetchApplicationsFn,
    deleting: boolean,
    deletingError?: Error | null,
    temporaryId?: number,
    locallySavedJobs?: ApplicationProps[]
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: ApplicationsState = {
    fetching: false,
    saving: false,
    deleting: false
};

const FETCH_APPLICATIONS_STARTED = 'FETCH_APPLICATIONS_STARTED';
const FETCH_APPLICATIONS_SUCCEEDED = 'FETCH_APPLICATIONS_SUCCEEDED';
const FETCH_APPLICATIONS_FAILED = 'FETCH_APPLICATIONS_FAILED';

const SAVE_APPLICATION_STARTED = 'SAVE_APPLICATION_STARTED';
const SAVE_APPLICATION_SUCCEEDED = 'SAVE_APPLICATION_SUCCEEDED';
const SAVE_APPLICATION_FAILED = 'SAVE_APPLICATION_FAILED';

const DELETE_APPLICATION_STARTED = 'DELETE_APPLICATION_STARTED';
const DELETE_APPLICATION_SUCCEEDED = 'DELETE_APPLICATION_SUCCEEDED';
const DELETE_APPLICATION_FAILED = 'DELETE_APPLICATION_FAILED';

const CHANGE_APPLICATIONS = 'CHANGE_APPLICATIONS';
// const CHANGE_LOCALLY_SAVED_JOBS = 'CHANGE_LOCALLY_SAVED_JOBS';
// const RESET_LOCAL_STORAGE = 'RESET_LOCAL_STORAGE';

const TEMPORARY_ID_PREFIX = 'TEMPORARY_ID_PREFIX';

const reducer: (state: ApplicationsState, action: ActionProps) => ApplicationsState =
    (state, { type, payload }) => {
        switch(type) {
            case FETCH_APPLICATIONS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_APPLICATIONS_SUCCEEDED:
                return { ...state, applications: payload.applications, fetching: false };
            // case FETCH_MORE_JOBS_SUCCEEDED:
            //     return { ...state, applications: [...(state.applications || []), ...(payload.applications || [])], fetching: false }; // copy new fetched applications to applications state
            case FETCH_APPLICATIONS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_APPLICATION_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_APPLICATION_SUCCEEDED: {
                const applications = [...(state.applications || [])];
                // const locallySavedApplications = [...(state.locallySavedApplications || [])]

                const application = payload.application;
                const index = applications.findIndex(a => a.jobId === application.jobId && a.workerId === application.workerId);

                if (index === -1) {
                    console.log(application);
                    applications.splice(0, 0, application);
                } else {
                    applications[index] = application;
                }

                // if(payload.networkStatus && !payload.networkStatus.connected) {
                //     const index = locallySavedApplications.findIndex(j => j._id === application._id);
                //     if (index === -1) {
                //         locallySavedApplications.splice(0, 0, application);
                //     } else {
                //         locallySavedApplications[index] = application;
                //     }
                // }
                return {...state, applications: applications, saving: false /*, temporaryId: payload.newTemporaryId, locallySavedJobs: locallySavedApplications*/};
            }
            case SAVE_APPLICATION_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            case CHANGE_APPLICATIONS:
                return { ...state, applications: payload.applications };
            // case CHANGE_LOCALLY_SAVED_JOBS:
            //     return { ...state, locallySavedApplications: payload.applications };
            // case RESET_LOCAL_STORAGE:
            //     return { ...state, temporaryId: 0, locallySavedApplications: [] }
            case DELETE_APPLICATION_STARTED:
                return { ...state, deletingError: null, deleting: true };
            case DELETE_APPLICATION_SUCCEEDED: {
                const applications = [...(state.applications || [])];

                const application = payload.application;
                const index = applications.findIndex(a => a.jobId === application.jobId && a.workerId === application.workerId);

                if (index !== -1) {
                    applications.splice(index, 1);
                }

                return {...state, applications: applications, deleting: false};
            }
            case DELETE_APPLICATION_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
        }
    };

export const ApplicationsContext = React.createContext<ApplicationsState>(initialState);

interface ApplicationsProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const ApplicationsProvider: React.FC<ApplicationsProviderProps> = ({ children }) => {
    const { token } = useContext(AuthContext);
    // const { networkStatus } = useNetwork();
    const [state, dispatch] = useReducer(reducer, initialState);
    const { applications, fetching, fetchingError, saving, savingError, deleting, deletingError/*, temporaryId, locallySavedJobs: locallySavedJobs */ } = state;

    useEffect(getApplicationsEffect, [token]);
    useEffect(wsEffect, [token]);

    const saveApplication = useCallback<SaveApplicationFn>(saveApplicationCallback, [token]);
    const deleteApplication = useCallback<DeleteApplicationFn>(deleteApplicationCallback, [token]);
    // const fetchMoreApplications = useCallback<FetchApplicationsFn>(fetchApplicationsCallback, [token, applications]);

    const value = { applications, fetching, fetchingError, saving, savingError, deleting, deletingError, saveApplication, deleteApplication };

    log('returns');

    return (
        <ApplicationsContext.Provider value={value}>
            {children}
        </ApplicationsContext.Provider>
    );

    function getApplicationsEffect() {
        let canceled = false;
        if (token) {
            fetchApplications();
        }
        return () => {
            canceled = true;
        }

        async function fetchApplications() {
            try {
                log('fetchApplications started');
                dispatch({ type: FETCH_APPLICATIONS_STARTED });
                // if client is an employer, applications that are brought are only for their jobs
                const applications = await getApplications(token);
                log('fetchApplications succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_APPLICATIONS_SUCCEEDED, payload: { applications } });
                }
            } catch (error) {
                log('fetchApplications failed', error);
                dispatch({ type: FETCH_APPLICATIONS_FAILED, payload: { error } });
            }
        }
    }

    async function saveApplicationCallback(application: ApplicationProps, mode: string) {
        try {
            log('saveApplication started');
            dispatch({ type: SAVE_APPLICATION_STARTED });

            let savedApplication;

            if(mode === ADD)
                savedApplication = await createApplication(token, application);
            else if(mode === UPDATE)
                savedApplication =  updateApplication(token, application);
            else throw Error("Function parameter 'mode' should either be 'add' or 'update'")

            log('saveApplication succeeded');
            dispatch({ type: SAVE_APPLICATION_SUCCEEDED, payload: { application: savedApplication, } });
        } catch (error) {
            log('saveApplication failed');
            dispatch({ type: SAVE_APPLICATION_FAILED, payload: { error } });
        }
    }

    async function deleteApplicationCallback(application: ApplicationProps) {
        try {
            log('deleteApplication started');
            dispatch({ type: DELETE_APPLICATION_STARTED });

            /* let deletedApplication = */ await removeApplication(token, application);

            log('deleteApplication succeeded');
            // dispatch({ type: DELETE_APPLICATION_SUCCEEDED, payload: { application: deletedApplication } });
        } catch (error) {
            log('deleteApplication failed');
            dispatch({ type: DELETE_APPLICATION_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, APPLICATIONS_WS_PATH, message => {
                if (canceled) {
                    return;
                }
                const { type, payload: application } = message;
                log(`ws message, application ${type}`);
                if (type === 'created' || type === 'updated') {
                    dispatch({ type: SAVE_APPLICATION_SUCCEEDED, payload: { application } });
                } else if (type === 'deleted') {
                    dispatch({ type: DELETE_APPLICATION_SUCCEEDED, payload: { application } });
                }
            });
        }
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};
