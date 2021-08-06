export default (axios: { get: (arg0: string) => any }) => ({
  fetchCars(location: string) {
    return axios.get(`/vehicles/${location}`);
  }
});
