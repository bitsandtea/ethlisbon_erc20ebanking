<template>
  <div id="app">
    <b-navbar fixed="top" type="dark" variant="primary" toggleable="md">
      <b-container>
        <!-- <b-navbar-brand href="/"
          ><b-img src="./assets/logo.svg" alt="Admin"
        /></b-navbar-brand> -->

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-form class="ml-2"
              ><ControllerUpdate
                variant="light"
                classes="btn-sm"
                :wallet.sync="wallet"
                @wallet-changed="walletChanged"
            /></b-nav-form>
          </b-navbar-nav>
        </b-collapse>
      </b-container>
    </b-navbar>
    <b-container id="main">
      <!-- <h1 class="float-left">View and update your account permissions</h1> -->
      <template v-if="wallet.isConnected && wallet.isNetworkSupported">
      </template>
        <template v-if="!wallet.isConnected">
          <h2>Connect first to see your account</h2>
          <ControllerUpdate
            variant="primary"
            classes="my-3"
            :wallet.sync="wallet"
            @wallet-changed="walletChanged"
          />
          <p class="small">We are in early beta</p>
        </template>
        <b-alert
          variant="danger"
          show
          class="w-50 m-auto"
          v-else-if="!wallet.isNetworkSupported"
        >
          <h4 class="alert-heading mt-3 font-weight-bold">
            Unsupported network
          </h4>¸
          <p>
            <strong>{{ wallet.networkName }}</strong> is not supported.
          </p>
          <p>Please change the network from your wallet.</p>
        </b-alert>
        <template v-else>
          <template>
            <h2>Current Permissions</h2>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Setting</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Daily Limit</td>
          <td>{{ wallet.userContractState.dailyLimit }}</td>
        </tr>
        <tr>
          <td>Weekly Limit</td>
          <td>{{ wallet.userContractState.weeklyLimit }}</td>
        </tr>
        <tr>
          <td>Monthly Limit</td>
          <td>{{ wallet.userContractState.monthlyLimit }}</td>
        </tr>
        <tr>
          <td>Minimum Reputation</td>
          <td>{{ wallet.userContractState.minReputation }}</td>
        </tr>
        <tr>
          <td>Transfer TX Cooldown</td>
          <td>{{ wallet.userContractState.transferTXCooldown }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
          <h2>Update Your Permissions</h2>
          <p class="medium">Transfer Transaction Cooldown: </p>
          <input v-model="transferTxCooldown" placeholder="3600"/>

          <p class="medium">Minimum Reputation: </p>
           <input v-model="minReputation" placeholder="80"/>
           
          <p class="medium">Daily Limit: </p>
          <input v-model="dailyLimit" placeholder="1000"/>

          <p class="medium">Weekly Limit: </p>
          <input v-model="weeklyLimit" placeholder="5000"/>

          <p class="medium">Monthly Limit: </p>
          <input v-model="monthlyLimit" placeholder="22000"/>
            <br/><br/><br/>

          <button v-on:click="processUpdate()">Update My Settings</button>
        </template>
      </b-card>
    </b-container>
    <section id="learnmore"></section>
    <footer class="navbar-dark">
      <b-container>
        <b-row>
          <b-col sm="4">ETH Lisbon Hackathon 2023 Dite Gashi</b-col>
          <b-col sm="8" class="text-right">
            <b-link
              href="https://www.ethglobal.com"
              target="_blank"
              >Privacy policy</b-link
            >
          </b-col> 
        </b-row>
      </b-container>
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Wallet } from "./lib/Wallet";
import ControllerUpdate from "@/components/ControllerUpdate.vue";

export default Vue.extend({
  name: "App",
  data: () => {
    return {
      wallet: new Wallet(),
      tokenChoices: Object(),
      transferTxCooldown: 3600,
      minReputation: 80,
      dailyLimit: 1000,
      weeklyLimit: 5000,
      monthlyLimit: 22000,
    };
  },
  components: {
    ControllerUpdate,
  },
  watch: {
    wallet() {
      this.walletChanged();
    },
  },
  mounted(){
    //get all token choices

  },
  methods: {
    async processUpdate() {
      /*
      address _token,
        uint _dailyLimit,
        uint _weeklyLimit,
        uint _monthlyLimit,
        uint _setMinReputation,
        uint _transferTXCooldown
        */
        await this.wallet.setBulk(this.wallet.mockTokenAddress, this.dailyLimit, this.weeklyLimit, this.monthlyLimit, this.minReputation, this.transferTxCooldown);
      
    },

    async walletChanged() {
    },
  },
});
</script>

<style>
.table-container {
  margin: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}


#main {
  padding-top: 110px;
}
.ddd-big-box {
  padding: 20px 20px;
  clear: both;
}

.csvText {
  width: 100%;
  height: 300px;
}
#learnmore {
  background: linear-gradient(306.84deg, #4f33ff 18.68%, #f29e87 103.05%);
  padding: 160px 0;
  margin-top: 100px;
  color: #fff;
  text-align: center;
}
#learnmore > .btn {
  margin: 12px 10px;
  font-weight: 600;
}
#learnmore > .btn:hover {
  color: #4f33ff;
}
#learnmore .btn-icon {
  display: inline-block;
  margin-bottom: -0.25rem;
  margin-left: -0.75rem;
  margin-right: 0.5rem;
}
#learnmore .btn-icon svg {
  display: block;
  transform: scale(1.2);
}
#learnmore .btn:hover svg * {
  fill: #4f33ff;
}

.allowance-warning {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #e95d5d !important;
}
</style>
