import axios from "axios";

const baseDomain =
  "https://web-chapter-coding-challenge-api-eu-central-1.dev.architecture.ridedev.io";
const baseURL = `${baseDomain}/api/architecture/web-chapter-coding-challenge-api`;

export default axios.create({
  baseURL
});
