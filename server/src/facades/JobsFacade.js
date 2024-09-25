import Router from "koa-router";
import {EMPLOYER, WORKER} from "../utils/constants.js";
import {RequestError} from "../utils/RequestError.js";
import {jobsBroadcast} from "../utils/wss.js";

export class JobsFacade {
    constructor(jobsService, wss) {
        this.jobsService = jobsService;
        this.jobsRouter = new Router();

        this.jobsRouter.get('/', async (ctx) => {
            const userId = ctx.state.user._id;
            const userType = ctx.state.user.userType;
            const numberOfLoadedJobs = ctx.query.numberOfLoadedJobs;

            if(numberOfLoadedJobs === undefined)
                ctx.response.status = 400; // bad request
            else if (userType) {
                if (userType === EMPLOYER)
                    ctx.response.body = await this.jobsService.jobsRepository.find({userId}, numberOfLoadedJobs);
                else // userType === WORKER
                    ctx.response.body = await this.jobsService.jobsRepository.find({}, numberOfLoadedJobs); // returns all jobs

                ctx.response.status = 200; // ok
            }
            else ctx.response.status = 401; // unauthorized
        });

        this.jobsRouter.get('/:id', async (ctx) => {
            const userId = ctx.state.user._id;
            const job = await this.jobsService.jobsRepository.findOne({ _id: ctx.params.id });
            if (job) {
                if (job.userId === userId) {
                    ctx.response.body = job;
                    ctx.response.status = 200; // ok
                } else {
                    ctx.response.status = 403; // forbidden
                }
            } else {
                ctx.response.status = 404; // not found
            }
        });

        const createJob = async (ctx, job, response) => {
            try {
                const userType = ctx.state.user.userType;
                if(userType === WORKER) {
                    throw new RequestError("Access denied", 403);
                }
                const userId = ctx.state.user._id;
                job.userId = userId;
                const jobWithId = await this.jobsService.jobsRepository.insert(job);
                response.body = jobWithId;
                response.status = 201; // created
                jobsBroadcast(wss, userId, {type: 'created', payload: jobWithId});
            } catch (err) {
                response.body = {message: err.message};
                if(err instanceof RequestError) {
                    response.status = err.statusCode;
                }
                else {
                    response.status = 400; // bad request
                }
            }
        };

        this.jobsRouter.post('/', async ctx => await createJob(ctx, ctx.request.body, ctx.response));

        const updateJob = async (ctx, response) => {
            try {
                const userType = ctx.state.user.userType;
                if (userType === WORKER) {
                    throw new RequestError("Access denied", 403);
                }

                const job = ctx.request.body;
                const id = ctx.params.id;
                const jobId = job._id;
                if (jobId && jobId !== id) {
                    response.body = {message: 'Param id and body id should be the same'};
                    response.status = 400; // bad request
                    return;
                }
                if (!jobId) {
                    await createJob(ctx, job, response);
                } else {
                    const userId = ctx.state.user._id;
                    job.userId = userId;
                    const updatedCount = await this.jobsService.jobsRepository.update({_id: id}, job);
                    if (updatedCount === 1) {
                        response.body = job;
                        response.status = 200; // ok
                        jobsBroadcast(wss, userId, {type: 'updated', payload: job});
                    } else {
                        response.body = {message: 'Resource no longer exists'};
                        response.status = 405; // method not allowed
                    }
                }
            } catch (err) {
                response.body = {message: err.message};
                if(err instanceof RequestError) {
                    response.status = err.statusCode;
                }
                else {
                    response.status = 400; // bad request
                }
            }
        }

        this.jobsRouter.put('/:id', async ctx => await updateJob(ctx, ctx.response));

        this.jobsRouter.del('/:id', async (ctx) => {
            const userId = ctx.state.user._id;
            const job = await this.jobsService.jobsRepository.findOne({ _id: ctx.params.id });
            if (job && userId !== job.userId) {
                ctx.response.status = 403; // forbidden
            } else {
                await this.jobsService.jobsRepository.remove({ _id: ctx.params.id });
                //TODO jobsBroadcast deletion to clients
                ctx.response.status = 204; // no content
            }
        });
    }
}