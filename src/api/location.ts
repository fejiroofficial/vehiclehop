export default (axios: { get: (arg0: string) => any }) => ({
  fetchLocations() {
    return axios.get("/locations");
  }
});
