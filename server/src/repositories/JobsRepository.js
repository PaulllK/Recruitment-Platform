import dataStore from 'nedb-promise';

export class JobsRepository {
  static numberOfJobsPerRequest = 15;

  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }

  async find(props, numberOfLoadedJobs) {
    let jobsForUser = await this.store.find(props);

    if(numberOfLoadedJobs === undefined)
      return jobsForUser;

    let jobsToBeLoaded = jobsForUser.slice(
      numberOfLoadedJobs,
      numberOfLoadedJobs + JobsRepository.numberOfJobsPerRequest
    );

    return jobsToBeLoaded;
  }

  async findOne(props) {
    return this.store.findOne(props);
  }

  async insert(job) {
    // validation
    // if (!job.brand) {
    //   throw new Error('Missing brand property')
    // }
    // if (!job.model) {
    //   throw new Error('Missing model property')
    // }
    // if (!job.year) {
    //   throw new Error('Missing year property')
    // }
    // if (!job.longitude) {
    //   throw new Error('Missing longitude property')
    // }
    // if (!job.latitude) {
    //   throw new Error('Missing latitude property')
    // }

    return this.store.insert(job);
  };

  async update(props, job) {
    return this.store.update(props, job);
  }

  async remove(props) {
    return this.store.remove(props);
  }
}
