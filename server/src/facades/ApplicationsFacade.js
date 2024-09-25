import Router from "koa-router";
import {UsersService} from "../services/UsersService.js";
import {EMPLOYER, WORKER} from "../utils/constants.js";
import {RequestError} from "../utils/RequestError.js";
import {applicationsBroadcast, jobsBroadcast} from "../utils/wss.js";

export class ApplicationsFacade {
    constructor(jobsService, applicationsService, wss) {
        this.jobsService = jobsService;
        this.applicationsService = applicationsService;

        this.applicationsRouter = new Router();

        this.applicationsRouter.get('/', async (ctx) => {
            const userId = ctx.state.user._id;
            const userType = ctx.state.user.userType;

            if (userType) {
                if (userType === WORKER)
                    ctx.response.body = await this.applicationsService.applicationsRepository.find({}); // returns all applications
                else { // userType === EMPLOYER
                    let jobs = await this.jobsService.jobsRepository.find({userId});
                    let jobIDs = jobs.map(j => j._id);
                    let applications = await this.applicationsService.applicationsRepository.find({});

                    ctx.response.body = applications.filter(a => jobIDs.includes(a.jobId));
                }

                ctx.response.status = 200; // ok
            }
            else ctx.response.status = 401; // unauthorized
        });

        const createApplication = async (ctx, application, response) => {
            try {
                const userType = ctx.state.user.userType;
                if(userType === EMPLOYER) {
                    throw new RequestError("Access denied", 403);
                }

                const userId = ctx.state.user._id;

                const storedApplication = await this.applicationsService.applicationsRepository.insert(application);
                if(storedApplication) {
                    response.body = storedApplication;
                    response.status = 201; // created
                    const job = await this.jobsService.jobsRepository.findOne({_id: storedApplication.jobId});
                    console.log("from create, emoloyerId:", job.userId);
                    applicationsBroadcast(wss, job.userId, {type: 'created', payload: storedApplication});
                } else throw new Error("Application already exists")
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

        this.applicationsRouter.post('/', async ctx => await createApplication(ctx, ctx.request.body, ctx.response));

        const updateApplication = async (ctx, response) => {
            try {
                const userType = ctx.state.user.userType;
                if (userType === WORKER) {
                    throw new RequestError("Access denied", 403);
                }

                const application = ctx.request.body;
                const jobId = application.jobId;
                const workerId = application.workerId;

                const updatedCount = await this.applicationsService.applicationsRepository.update(
                    {jobId, workerId},
                    application
                );

                if (updatedCount === 1) {
                    response.body = application;
                    response.status = 200; // ok
                    const job = await this.jobsService.jobsRepository.findOne({_id: jobId});
                    applicationsBroadcast(wss, job.userId, {type: 'updated', payload: application});
                } else {
                    response.body = {message: 'Resource no longer exists'};
                    response.status = 405; // method not allowed
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

        this.applicationsRouter.put('/', async ctx => await updateApplication(ctx, ctx.response));

        this.applicationsRouter.del('/', async (ctx) => {
            const userId = ctx.state.user._id;
            const userType = ctx.state.user.userType;

            const jobId = ctx.query.jobId;
            const workerId = ctx.query.workerId;

            const foundApplication = await this.applicationsService.applicationsRepository.findOne({ jobId, workerId });

            // if (foundApplication && userId !== foundApplication.userId) {
            //     ctx.response.status = 403; // forbidden
            // } else {
            await this.applicationsService.applicationsRepository.remove({ jobId, workerId });

            let employerId;

            if (userType === EMPLOYER) {
                employerId = userId;
            } else {
                const job = await this.jobsService.jobsRepository.findOne({_id: jobId});
                employerId = job.userId;
            }

            console.log(employerId);
            applicationsBroadcast(wss, employerId, {type: 'deleted', payload: foundApplication});

            ctx.response.status = 204; // no content
            // }
        });
    }

}