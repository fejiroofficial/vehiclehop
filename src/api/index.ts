import axiosClient from "@/axiosClient";
import Car from "@/api/car";
import Location from "@/api/location";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const repositories: { [key: string]: any } = {
  car: Car(axiosClient),
  location: Location(axiosClient)
};

export const RespositoryFactory = {
  get: (name: string) => repositories[name]
};
