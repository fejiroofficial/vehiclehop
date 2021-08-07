import { AxiosPromise } from "axios";

export default (axios: { get: (arg0: string) => AxiosPromise }) => ({
  fetchLocations() {
    return axios.get("/locations");
  }
});
