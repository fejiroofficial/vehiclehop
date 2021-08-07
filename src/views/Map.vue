<template>
  <div class="mapComponent">
    <img width="100" class="logo" src="../assets/share-now-logo.png" />
    <select class="location-selector" @change="onCityChange">
      <option value="none" selected disabled hidden>
        Pick a location
      </option>
      <option
        v-for="location in locations"
        :key="location.id"
        :value="location.name"
      >
        {{ location.name }}
      </option>
    </select>
    <div v-if="showFilter" class="filter">
      <div class="header-section">
        <img
          src="@/assets/close-icon.svg"
          alt="filter icon"
          role="button"
          class="close-filter"
          @click="showFilter = false"
        />
        <div class="title">
          <h4>Filter</h4>
        </div>
      </div>
      <hr />
      <div class="body-section">
        <h4 class="sub-title">Model</h4>
        <div v-for="(model, index) in models" :key="index" class="check-input">
          <input type="checkbox" :value="model" v-model="checkedModels" />
          <label for="scales">{{ model }}</label>
        </div>
        <hr />
        <h4 class="sub-title">Fuel</h4>
        <input
          type="range"
          name="fuel"
          min="0"
          max="1"
          step="0.1"
          v-model="fuelLevel"
        />
        <input type="text" readonly v-model="fuelLevel" />
        <div class="btn-group">
          <button @click="clearFilter(map)" class="btn btn-tertiary">
            CLEAR
          </button>
          <button @click="applyFilter(map)" class="btn btn-primary">
            APPLY
          </button>
        </div>
      </div>
    </div>
    <div class="filter-control" @click="showFilter = !showFilter">
      <img src="@/assets/filter-icon.svg" alt="filter icon" />
    </div>
    <div class="map" id="map"></div>
  </div>
</template>

<script lang="ts">
import L from "leaflet";
import _ from "underscore";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";
import { CUSTOM_PINS } from "@/constants";
import { RespositoryFactory } from "@/api";

const CarRepository = RespositoryFactory.get("car");
const LocationRepository = RespositoryFactory.get("location");

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});

export default {
  name: "Home",
  components: {},
  data: () => ({
    locations: [],
    map: null as L.Map | null,
    interval: 0,
    showFilter: false,
    cars: [],
    models: [],
    fuelLevel: 0,
    checkedModels: [],
    markerPoints: [],
    filterApplied: false,
    customPins: []
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
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
          }
        )
      ]
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

    renderDetails(map, cars) {
      const icons = [
        L.icon({
          iconRetinaUrl: require("../assets/car1.png"),
          iconUrl: require("../assets/car1.png"),
          shadowSize: [0, 0],
          iconSize: [100, 100]
        }),
        L.icon({
          iconRetinaUrl: require("../assets/car2.png"),
          iconUrl: require("../assets/car2.png"),
          shadowSize: [0, 0],
          iconSize: [106, 46]
        }),
        L.icon({
          iconRetinaUrl: require("../assets/car3.png"),
          iconUrl: require("../assets/car3.png"),
          shadowSize: [0, 0],
          iconSize: [90, 90]
        })
      ];
      const markers: any = [];
      cars.forEach(car => {
        const marker = L.marker(
          [car.position.latitude, car.position.longitude],
          {
            icon: icons[Math.floor(Math.random() * icons.length)]
          }
        )
          .on("click", this.markerOnClick)
          .addTo(map)
          .bindPopup(
            `Model: ${car.model} <br/> Vin: ${car.vin}. <br/> Plate number: ${car.numberPlate} <br/> Fuel: ${car.fuel}`
          );
        const iconImage = CUSTOM_PINS[car.model];
        const pin = L.marker([car.position.latitude, car.position.longitude], {
          icon: L.icon({
            iconRetinaUrl: require(`../assets/${iconImage}.png`),
            iconUrl: require(`../assets/${iconImage}.png`),
            shadowSize: [0, 0],
            iconSize: [20, 20]
          })
        })
          .on("click", this.markerOnClick)
          .addTo(map)
          .bindPopup(
            `Model: ${car.model} <br/> Vin: ${car.vin}. <br/> Plate number: ${car.numberPlate} <br/> Fuel: ${car.fuel}`
          );
        const guage = "I".repeat(car.fuel * 10);
        const fuelIndicator = L.marker(
          [car.position.latitude, car.position.longitude],
          {
            icon: L.divIcon({
              className: "my-div-icon",
              html: `<p class='fuel-guage'>${guage}</p>`
            })
          }
        )
          .on("click", this.markerOnClick)
          .addTo(map)
          .bindPopup(
            `Model: ${car.model} <br/> Vin: ${car.vin}. <br/> Plate number: ${car.numberPlate} <br/> Fuel: ${car.fuel}`
          );
        markers.push(marker, pin, fuelIndicator);
      });
      this.markerPoints = [...this.markerPoints, ...markers];
    },

    async fetchCars(location, map) {
      try {
        const response = await CarRepository.fetchCars(location);

        const { data } = response.data;
        this.cars = [...this.cars, ...data];
        this.models = _.uniq(_.pluck(data, "model"));
        if (this.filterApplied) {
          this.applyFilter(map);
        } else {
          this.renderDetails(map, data);
        }
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
        location => location.name === event.target.value
      );
      if (targetLocation) {
        const center = targetLocation.mapSection.center;
        this.map?.flyTo([center.latitude, center.longitude], 13);
        // poll vehicles update every 60 seconds
        this.pollVehicles(event.target.value, 60000);
      }
    },

    markerOnClick(e) {
      const { lat, lng } = e.latlng;
      this.map.setView(L.latLng(lat, lng), 20);
    },

    clearMarkers() {
      this.markerPoints.forEach(marker => {
        marker.remove();
      });
      this.markerPoints = [];
    },

    applyFilter(map) {
      this.filterApplied = true;
      this.clearMarkers();
      const cars = _.filter(this.cars, car => {
        if (!this.checkedModels.length) {
          return car.fuel === Number(this.fuelLevel);
        } else {
          return (
            this.checkedModels.includes(car.model) &&
            car.fuel === Number(this.fuelLevel)
          );
        }
      });
      this.renderDetails(map, cars);
    },

    clearFilter(map) {
      this.filterApplied = false;
      this.checkedModels = [];
      this.fuelLevel = 0;
      this.clearMarkers();
      this.renderDetails(map, this.cars);
    }
  }
};
</script>

<style lang="scss" src="../assets/css/map.scss"></style>
