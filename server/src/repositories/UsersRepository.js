import dataStore from "nedb-promise";

export class UsersRepository {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }

  async find(props) {
    return this.store.find(props);
  }

  async findOne(props) {
    return this.store.findOne(props);
  }

  async insert(user) {
    return this.store.insert(user);
  };
}
