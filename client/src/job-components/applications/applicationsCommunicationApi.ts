import {authConfig, baseUrl, withLogs} from "../../core";
import axios from "axios";
import {ApplicationProps} from "./ApplicationProps";

const applicationsUrl = `http://${baseUrl}/api/applications`;

export const getApplications: (token: string) => Promise<ApplicationProps[]> = (token) => {
    return withLogs(axios.get(applicationsUrl, authConfig(token)), 'getApplications');
}

export const createApplication: (token: string, application: ApplicationProps) => Promise<ApplicationProps[]> =
    (token, application) => {
        return withLogs(axios.post(applicationsUrl, application, authConfig(token)), 'createApplication');
}

export const updateApplication: (token: string, application: ApplicationProps) => Promise<ApplicationProps[]> =
    (token, application) => {
    return withLogs(axios.put(applicationsUrl, application, authConfig(token)), 'updateApplication');
}

export const removeApplication: (token: string, application: ApplicationProps) => Promise<ApplicationProps[]> =
    (token, application) => {
    return withLogs(
        axios.delete(
            applicationsUrl,
            authConfig(token, { jobId: application.jobId, workerId: application.workerId })
        ),
        'deleteApplication'
    );
}