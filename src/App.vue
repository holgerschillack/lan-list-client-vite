<template>
  <div class="min-h-screen max-w-4xl mx-auto p-6 flex flex-col space-y-4">
    <h1 class="text-2xl md:text-3xl font-semibold text-cyan-600 leading-relaxed">
      Lokales Netzwerk - {{ filteredDevices.length }} Geräte gefunden
    </h1>

    <div class="flex flex-row justify-between space-x-2">
      <div class="flex relative w-3/5 max-w-md">
        <input
          class="focus:outline-none focus:ring focus:border-cyan-600 border-2 h-12 px-5 pr-16 rounded-md w-full text-black text-lg bg-gray-200 placeholder-gray-600"
          type="search"
          autocomplete="off"
          placeholder="Suche Name oder IP..."
          v-model="filterText"
          @input="filterList"
          ref="input"
        />
        <button class="absolute right-2 top-3 mr-4">
          <svg
            class="text-black h-6 w-6 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            version="1.1"
            id="Capa_1"
            x="0px"
            y="0px"
            viewBox="0 0 56.966 56.966"
            style="enable-background: new 0 0 56.966 56.966"
            xml:space="preserve"
            width="512px"
            height="512px"
          >
            <path
              d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z"
            />
          </svg>
        </button>
      </div>

      <div class="flex justify-end w-2/5" v-if="isLoading">
        <div class="flex justify-center w-48">
          <div
            style="border-top-color: transparent"
            class="w-12 h-12 border-8 border-cyan-600 rounded-full loader"
          />
        </div>
      </div>
      <div class="flex justify-end w-2/5" v-if="!isLoading">
        <button
          class="bg-cyan-600 hover:bg-blue-dark text-white text-lg py-2 px-4 rounded h-12 w-48"
          @click="() => this.fetchDevices(true)"
        >
          Aktualisieren
        </button>
      </div>
    </div>

    <div class="py-4">
      <table class="w-full">
        <thead class="text-left">
          <tr class="bg-cyan-600 rounded-xl h-8">
            <th class="w-6/12 px-2">
              <div
                class="flex align-middle space-x-6"
                :class="{'cursor-pointer': sorting !== 'name'}"
                @click="() => changeSorting('name')"
              >
                <div class="text-white">Name</div>
                <div v-if="sorting !== 'name'">
                  <img src="./assets/sort.png" style="height: 24px" />
                </div>
              </div>
            </th>
            <th class="w-4/12 px-2">
              <div
                class="flex align-middle space-x-6"
                :class="{'cursor-pointer': sorting !== 'ip'}"
                @click="() => changeSorting('ip')"
              >
                <div class="text-white">IP-Adresse</div>
                <div v-if="sorting !== 'ip'">
                  <img src="./assets/sort.png" style="height: 24px" />
                </div>
              </div>
            </th>
            <th class="w-1/6 px-2">
              <span class="text-white">Link</span>
            </th>
          </tr>
        </thead>
        <tbody class="">
          <tr
            v-for="(dev, index) in filteredDevices"
            :key="index"
            class="h-8 px-2"
            :class="index % 2 === 0 ? 'bg-gray-200' : 'bg-white'"
          >
            <td class="px-2">
              <span class="font-semibold">{{ dev.name }}</span>
            </td>
            <td>
              <span class="px-2">{{ dev.ip }}</span>
            </td>
            <td class="px-2">
              <span>
                <a :href="`http://${dev.ip}`" target="_blank">Öffnen</a>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <br />
  </div>
</template>

<script>
// import Vue from "vue";

const API_URL = "http://192.168.178.65:4100/api/devices";
const REFRESH_URL = "http://192.168.178.65:4100/api/refresh";

export default {
  name: "App",
  data() {
    return {
      devices: [],
      filteredDevices: [],
      filterText: "",
      isLoading: false,
      sorting: "name",
      error: false,
    };
  },
  mounted() {
    this.fetchDevices();
    this.$refs.input.focus();
  },
  methods: {
    fetchDevices(refresh = false) {
      this.isLoading = true;
      this.error = false;
      fetch(refresh ? REFRESH_URL : API_URL)
        .then((response) => response.json())
        .then((res) => {
          if (refresh)
            Vue.$toast.open({
              message: "Daten empfangen",
              position: "top-right",
              duration: 2000,
            });
          this.error = false;
          this.isLoading = false;
          this.devices = this.sortDevices(res);
          this.filterList();
        })
        .catch((err) => {
          Vue.$toast.open({
            message: "API Fehler :(",
            position: "top-right",
            type: "error",
            duration: 2000,
          });
          this.error = true;
          this.isLoading = false;
          console.log(err);
        });
    },
    sortDevices(devs) {
      if (this.sorting === "ip") {
        devs.sort((a, b) => {
          const num1 = Number(
            a.ip
              .split(".")
              .map((num) => `000${num}`.slice(-3))
              .join("")
          );
          const num2 = Number(
            b.ip
              .split(".")
              .map((num) => `000${num}`.slice(-3))
              .join("")
          );
          return num1 - num2;
        });
      } else {
        devs.sort((a, b) => (a.name > b.name && 1) || -1);
      }
      return devs;
    },
    filterList() {
      const newList = this.devices.filter(
        (dev) =>
          dev.name.toLowerCase().indexOf(this.filterText.toLowerCase()) !== -1 ||
          dev.ip.indexOf(this.filterText) !== -1
      );
      this.sortDevices(newList);
      this.filteredDevices = newList;
    },
    changeSorting(sorting) {
      this.sorting = sorting;
      this.filterList();
    },
  },
};
</script>

<style>
#app {
  padding: 8px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", "Noto Color Emoji";
}

body {
  -ms-overflow-style: none; /* for Internet Explorer, Edge */
  scrollbar-width: none; /* for Firefox */
  overflow-y: scroll;
}

body::-webkit-scrollbar {
  display: none; /* for Chrome, Safari, and Opera */
}

@keyframes loader-rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
.loader {
  border-right-color: transparent;
  animation: loader-rotate 1s linear infinite;
}
</style>
