import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { JobProps } from './JobProps';
import {jwtDecode} from "jwt-decode";

const jobsUrl = `http://${baseUrl}/api/jobs`;

export const getJobs: (token: string, numberOfLoadedJobs: number) => Promise<JobProps[]> = (token, numberOfLoadedJobs) => {
  return withLogs(axios.get(jobsUrl, authConfig(token, { numberOfLoadedJobs })), 'getJobs');
}

export const createJob: (token: string, job: JobProps) => Promise<JobProps[]> = (token, job) => {
  return withLogs(axios.post(jobsUrl, job, authConfig(token)), 'createJob');
}

export const updateJob: (token: string, job: JobProps) => Promise<JobProps[]> = (token, job) => {
  return withLogs(axios.put(`${jobsUrl}/${job._id}`, job, authConfig(token)), 'updateJob');
}




