import { AxiosPromise } from "axios";

export default (axios: { get: (arg0: string) => AxiosPromise }) => ({
  fetchCars(location: string) {
    return axios.get(`/vehicles/${location}`);
  }
});
