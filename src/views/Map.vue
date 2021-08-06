<template>
  <div class="mapComponent">
    <img width="100" class="logo" src="../assets/share-now-logo.png" />
    <select class="location-selector" @change="onCityChange">
      <option value="none" selected disabled hidden>
        Select a location
      </option>
      <option
        v-for="location in locations"
        :key="location.id"
        :value="location.name"
      >
        {{ location.name }}
      </option>
    </select>
    <div class="map" id="map"></div>
  </div>
</template>

<script lang="ts">
import L from "leaflet";
import _ from "underscore";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";
import { RespositoryFactory } from "@/api";

const CarRepository = RespositoryFactory.get("car");
const LocationRepository = RespositoryFactory.get("location");

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default {
  name: "Home",
  components: {},
  data: () => ({
    locations: [],
    map: null as L.Map | null,
    interval: 0,
  }),
  mounted() {
    this.map = L.map("map", {
      center: [51.5, 9.97],
      zoom: 5,
      doubleClickZoom: false,
      layers: [
        L.tileLayer(
          "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png",
          {
            maxZoom: 18,
            attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
          }
        ),
      ],
    });

    this.fetchLocations(this.map);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },

  methods: {
    async fetchLocations(map) {
      try {
        const response = await LocationRepository.fetchLocations();
        const locations = response.data.data;
        this.locations = locations;
        for (const location of locations) {
          await this.fetchCars(location.name, map);
        }
      } catch (error) {
        console.log(error);
      }
    },

    async fetchCars(location, map) {
      try {
        const response = await CarRepository.fetchCars(location);
        const icons = [
          L.icon({
            iconRetinaUrl: require("../assets/car1.png"),
            iconUrl: require("../assets/car1.png"),
            shadowSize: [0, 0],
            iconSize: [100, 100],
          }),
          L.icon({
            iconRetinaUrl: require("../assets/car2.png"),
            iconUrl: require("../assets/car2.png"),
            shadowSize: [0, 0],
            iconSize: [106, 46],
          }),
          L.icon({
            iconRetinaUrl: require("../assets/car3.png"),
            iconUrl: require("../assets/car3.png"),
            shadowSize: [0, 0],
            iconSize: [90, 90],
          }),
        ];

        const cars = response.data.data;

        cars.forEach((car) => {
          L.marker([car.position.latitude, car.position.longitude], {
            icon: icons[Math.floor(Math.random() * icons.length)],
          }).addTo(map);
        });
      } catch (error) {
        console.log(error);
      }
    },
    pollVehicles(location: string, time: number) {
      if (this.interval) {
        // clear any previous poll
        clearInterval(this.interval);
        this.interval = 0;
      }
      this.interval = setInterval(() => {
        this.fetchCars(location, this.map);
      }, time);
    },
    onCityChange(event) {
      const targetLocation = _.find(
        this.locations,
        (location) => location.name === event.target.value
      );
      if (targetLocation) {
        const center = targetLocation.mapSection.center;
        this.map.setView(L.latLng(center.latitude, center.longitude), 10);
        // poll vehicles update every 60 seconds
        this.pollVehicles(event.target.value, 60000);
      }
    },
  },
};
</script>

<style lang="scss" src="../assets/css/map.scss"></style>
