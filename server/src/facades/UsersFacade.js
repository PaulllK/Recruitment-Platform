import Router from "koa-router";
import jwt from "jsonwebtoken";
import {EMPLOYER, jwtConfig, WORKER} from "../utils/constants.js";

export class UsersFacade {
    constructor(usersService) {
        this.usersService = usersService;
        this.authRouter = new Router();

        const createToken = (user) => {
            return jwt.sign(
                {
                    username: user.username,
                    _id: user._id,
                    userType: user.type,
                    name: user.type === EMPLOYER ? user.name : undefined,
                    firstName: user.type === WORKER ? user.firstName : undefined,
                    lastName: user.type === WORKER ? user.lastName : undefined,
                    phoneNumber: user.type === WORKER ? user.phoneNumber : undefined
                },
                jwtConfig.secret,
                { expiresIn: 60 * 60 * 60 }
            );
        };

        this.authRouter.post('/signup', async (ctx) => {
            try {
                const user = ctx.request.body;
                await this.usersService.usersRepository.insert(user);
                ctx.response.body = { token: createToken(user) };
                ctx.response.status = 201; // created
            } catch (err) {
                ctx.response.body = { error: err.message };
                ctx.response.status = 400; // bad request
            }

            await createUser(ctx.request.body, ctx.response)
        });

        this.authRouter.post('/login', async (ctx) => {
            const credentials = ctx.request.body;
            const user = await this.usersService.usersRepository.findOne({ username: credentials.username });
            if (user && credentials.password === user.password) {
                ctx.response.body = { token: createToken(user) };
                ctx.response.status = 201; // created
            } else {
                ctx.response.body = { error: 'Invalid credentials' };
                ctx.response.status = 400; // bad request
            }
        });

        this.authRouter.get('/get', async (ctx) => {
            ctx.response.body = await this.usersService.usersRepository.find({type: WORKER});
            ctx.response.status = 200; // ok
        });
    }
}