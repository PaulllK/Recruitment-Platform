import dataStore from "nedb-promise";

export class ApplicationsRepository {
    constructor({ filename, autoload }) {
        this.store = dataStore({ filename, autoload });
    }

    async find(props) {
        return this.store.find(props);
    }

    async findOne(props) {
        return this.store.findOne(props);
    }

    async insert(application) {
        // validation

        let foundApplication = await this.store.findOne({ jobId: application.jobId, workerId: application.workerId });

        if(!foundApplication)
            return this.store.insert(application);

        return null;
    };

    async update(props, application) {
        return this.store.update(props, application);
    }

    async remove(props) {
        return this.store.remove(props);
    }
}