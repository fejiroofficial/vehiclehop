import axiosClient from "@/axiosClient";
import Car from "@/api/car";
import Location from "@/api/location";

const repositories: { [key: string]: any } = {
  car: Car(axiosClient),
  location: Location(axiosClient)
};

export const RespositoryFactory = {
  get: (name: string) => repositories[name]
};
