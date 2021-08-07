<template>
  <div class="mapComponent">
    <img width="100" class="logo" src="../assets/logo.png" />
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
    <MapFilter
      v-if="showFilter"
      :models="models"
      @applyFilter="applyFilter"
      @clearFilter="clearFilter"
      @close="showFilter = false"
      ref="filterDetails"
    />
    <div class="filter-control" @click="showFilter = !showFilter">
      <img src="@/assets/filter-icon.svg" alt="filter icon" />
    </div>
    <div class="map" id="map"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import L from "leaflet";
import _ from "underscore";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/images/marker-shadow.png";
import { CUSTOM_PINS } from "@/constants";
import { RespositoryFactory } from "@/api";
import MapFilter from "@/components/MapFilter.vue";

const CarRepository = RespositoryFactory.get("car");
const LocationRepository = RespositoryFactory.get("location");

interface Position {
  latitude: number;
  longitude: number;
}

interface LatLng {
  lat: number;
  lng: number;
}

interface MapSection {
  center: Position;
  upperLeft: Position;
  upperRight: Position;
}

interface Car {
  id: number;
  vin: string;
  numberPlate: string;
  fuel: number;
  model: string;
  position: Position;
}

interface Location {
  id: number;
  name: string;
  mapSection: MapSection;
}

export default Vue.extend({
  name: "Home",
  components: {
    MapFilter
  },
  data() {
    return {
      locations: [] as Location[],
      map: {} as L.Map,
      interval: 0,
      showFilter: false,
      cars: [] as Car[],
      models: [] as string[],
      markerPoints: [] as L.Marker[],
      filterApplied: false,
      customPins: []
    };
  },
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
    async fetchLocations(map: L.Map) {
      try {
        const {
          data: { data },
          status
        } = await LocationRepository.fetchLocations();
        if (status === 200) {
          const locations = data;
          this.locations = locations;
          for (const location of locations) {
            await this.fetchCars(location.name, map);
          }
        }
      } catch (error) {
        this.$toasted.error(
          "Something went wrong fetching the data. Please try again later"
        );
      }
    },

    renderDetails(map: L.Map, cars: Car[]) {
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
      const markers: L.Marker[] = [];
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
            iconSize: [30, 30]
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
              className: "guage-icon",
              html: `<p class='fuel-guage ${
                guage.length > 3 ? "fuel-up" : "fuel-down"
              }'>${guage}</p>`
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

    async fetchCars(location: string, map: L.Map) {
      try {
        const {
          data: { data },
          status
        } = await CarRepository.fetchCars(location);

        if (status === 200) {
          this.cars = [...this.cars, ...data];
          this.models = _.uniq(_.pluck(data, "model"));
          if (this.filterApplied) {
            this.applyFilter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (this.$refs.filterDetails as any).fuelLevel,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (this.$refs.filterDetails as any).checkedModels
            );
          } else {
            this.renderDetails(map, data);
          }
        }
      } catch (error) {
        this.$toasted.error(
          "Something went wrong fetching the data. Please try again later"
        );
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

    onCityChange(event: { target: { value: string } }) {
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

    markerOnClick(e: { latlng: LatLng }) {
      const { lat, lng } = e.latlng;
      this.map.setView(L.latLng(lat, lng), 20);
    },

    clearMarkers() {
      this.markerPoints.forEach(marker => {
        marker.remove();
      });
      this.markerPoints = [];
    },

    applyFilter(fuelLevel: number, checkedModels: string[]) {
      this.filterApplied = true;
      this.clearMarkers();
      const cars = _.filter(this.cars, car => {
        if (!checkedModels.length) {
          return car.fuel === Number(fuelLevel);
        } else {
          return (
            checkedModels.includes(car.model) && car.fuel === Number(fuelLevel)
          );
        }
      });
      this.renderDetails(this.map, cars);
    },

    clearFilter() {
      this.filterApplied = false;
      this.clearMarkers();
      this.renderDetails(this.map, this.cars);
    }
  }
});
</script>

<style lang="scss" src="../assets/css/map.scss"></style>
