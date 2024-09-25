import {ApplicationsRepository} from "../repositories/ApplicationsRepository.js";

export class ApplicationsService {
    constructor() {
        this.applicationsRepository = new ApplicationsRepository({ filename: './db/applications.json', autoload: true });
    }
}