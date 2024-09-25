import http from 'http';
import Koa from 'koa';
import WebSocket from 'ws';
import Router from 'koa-router';

import bodyParser from "koa-bodyparser";
import jwt from 'koa-jwt';
import cors from '@koa/cors';

import { jwtConfig, timingLogger, exceptionHandler } from './utils/constants.js';
import { initWss } from './utils/wss.js';

import { JobsService } from './services/JobsService.js';
import { UsersService } from "./services/UsersService.js";
import { ApplicationsService } from "./services/ApplicationsService.js";

import {UsersFacade} from "./facades/UsersFacade.js";
import {JobsFacade} from "./facades/JobsFacade.js";
import {ApplicationsFacade} from "./facades/ApplicationsFacade.js";

const app = new Koa();

const server = http.createServer(app.callback());

const jobsWss = new WebSocket.Server({ noServer: true });
const applicationsWss = new WebSocket.Server({ noServer: true });

initWss(jobsWss);
initWss(applicationsWss);

// Handle upgrade events from the HTTP server
server.on('upgrade', function(request, socket, head) {
    const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

    if (pathname === '/jobs') {
        jobsWss.handleUpgrade(request, socket, head, function(ws) {
            jobsWss.emit('connection', ws, request);
        });
    } else if (pathname === '/applications') {
        applicationsWss.handleUpgrade(request, socket, head, function(ws) {
            applicationsWss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

app.use(cors());
app.use(timingLogger);
app.use(exceptionHandler);
app.use(bodyParser());

const prefix = '/api';

const usersService = new UsersService();
const jobsService = new JobsService();
const applicationsService = new ApplicationsService();

const usersFacade = new UsersFacade(usersService);
const jobsFacade = new JobsFacade(jobsService, jobsWss);
const applicationsFacade = new ApplicationsFacade(jobsService, applicationsService, applicationsWss);

// public
const publicApiRouter = new Router({ prefix });

publicApiRouter.use('/auth', usersFacade.authRouter.routes());

app.use(publicApiRouter.routes()).use(publicApiRouter.allowedMethods());

app.use(jwt(jwtConfig));

// protected
const protectedApiRouter = new Router({ prefix });

protectedApiRouter.use('/jobs', jobsFacade.jobsRouter.routes());
protectedApiRouter.use('/applications', applicationsFacade.applicationsRouter.routes());

app.use(protectedApiRouter.routes()).use(protectedApiRouter.allowedMethods());

server.listen(3000);
console.log('started on port 3000');
