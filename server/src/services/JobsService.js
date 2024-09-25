import {JobsRepository} from "../repositories/JobsRepository.js";
import Router from "koa-router";
import {EMPLOYER, WORKER} from "../utils/constants.js";
import {RequestError} from "../utils/RequestError.js";
import {jobsBroadcast} from "../utils/wss.js";

export class JobsService {
    constructor() {
        this.jobsRepository = new JobsRepository({ filename: './db/jobs.json', autoload: true });
    }
}