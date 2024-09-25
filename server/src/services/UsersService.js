import {UsersRepository} from "../repositories/UsersRepository.js";

export class UsersService {
    constructor() {
        this.usersRepository = new UsersRepository({ filename: './db/users.json', autoload: true });
    }

}