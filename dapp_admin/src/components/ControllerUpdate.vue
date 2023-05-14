<template>
  <b-overlay
    :show="loading || !browserSupported"
    rounded="pill"
    spinner-small
    z-index="1"
  >
    <template #overlay v-if="!browserSupported"
      ><div
        class="text-center text-uppercase font-weight-bold"
        style="letter-spacing: normal; font-size: 70% !important"
      >
        Please install MetaMask
      </div></template
    >
    <b-button
      pill
      :variant="`outline-${variant}`"
      :class="`${classes}`"
      @click="connect"
      :disabled="loading"
      v-if="!connected"
    >
      <template v-if="false"><b-spinner small /></template>
      <template v-else>Connect Wallet</template>
    </b-button>
    <b-button
      pill
      variant="success"
      :class="`${classes}`"
      v-b-modal:wallet-info
      v-else
    >
      {{ walletAddress.replace(/(.{5})..+(.{2})/, "$1&hellip;$2") }}
    </b-button>

    <b-modal
      id="wallet-info"
      hide-footer
      :title="
        providerName === undefined
          ? 'Your Wallet'
          : `Your Wallet (via ${providerName})`
      "
      v-model="isWalletModalVisible"
    >
      <template v-if="!connected">
        <b-alert variant="info" show>Not connected</b-alert>
        <b-button block variant="primary" pill @click="connect"
          >Reconnect</b-button
        >
      </template>
      <template v-else>
        <b-alert variant="danger" :show="!networkSupported"
          >Unsupported network ({{ networkName }})
        </b-alert>
        <b-form-group label="Your Wallet Address" label-for="wallet">
          <b-form-input
            id="wallet"
            v-model="walletAddress"
            disabled
          ></b-form-input>
        </b-form-group>
        <b-button
          block
          variant="light"
          pill
          v-if="providerName === 'WalletConnect'"
          @click="disconnect"
          >Disconnect</b-button
        >
      </template>
    </b-modal>
  </b-overlay>
</template>

<script lang="ts">
import Vue from "vue";
import { Wallet } from "@/lib/Wallet";
import WalletConnectProvider from "@walletconnect/web3-provider";
import config from "@/config";
import Web3Modal, { getProviderInfo } from "web3modal";
import { WalletProvider } from "@/lib/Interfaces";

export default Vue.extend({
  name: "ControllerUpdate",
  props: {
    wallet: Wallet,
    variant: String,
    classes: String,
  },
  data: () => {
    return {
      loading: true,
      providerName: "" as string | undefined,
      isWalletModalVisible: false,
      browserSupported: false,
    };
  },
  computed: {
    connected(): boolean {
      return this.wallet.isConnected;
    },
    walletAddress(): string {
      return this.wallet.walletAddress;
    },
    networkName(): string {
      return this.wallet.networkName;
    },
    networkSupported(): boolean {
      return this.wallet.isNetworkSupported;
    },
    userContractState(): any{
      return this.wallet.userContractState;
    }
  },
  methods: {
    getWeb3Modal() {
      const providerOptions = {
      };
      return new Web3Modal({
        cacheProvider: true,
        providerOptions,
      });
    },
    async connect() {
      this.isWalletModalVisible = false;
      this.loading = true;
      try {
        const provider = await this.getWeb3Modal().connect();
        await this.connectWallet(provider);
        if (!(await this.authenticateAdmin())) {
          console.log("You are not admin");
          await this.disconnect();
        } else {
          console.log("Connected as admin");
        }
      } finally {
        this.loading = false;
      }
    },
    async authenticateAdmin() {
      try {
        //TODO
        return 1;
      } catch (err) {
        console.log("error: ", err);
      } finally {
        this.loading = false;
      }
    },
    async connectWallet(provider: WalletProvider) {
      try {
        const wallet = await Wallet.init(provider);
        this.providerName = getProviderInfo(provider).name;

        if (!wallet.isConnected) {
          await this.disconnect();
        } else {
          provider.on!("chainChanged", async () => {
            await this.wallet.updateNetworkName();
            this.$emit("wallet-changed");
          });
          provider.on!("disconnect", this.disconnect);
          provider.on!("accountsChanged", async () => {
            await this.wallet.updateAccount();
            this.$emit("wallet-changed");
          });

          this.$emit("update:wallet", wallet);
        }
      } catch (error: any) {
        (this as any).$bvToast.toast(`${error.message}`, {
          title: "Error",
          variant: "danger",
          solid: true,
          toaster: "b-toaster-top-center",
          noAutoHide: true,
        });
      }
    },
    async disconnect() {
      await this.getWeb3Modal().clearCachedProvider();
      await this.wallet.disconnect();
      this.providerName = undefined;
      this.$emit("update:wallet", new Wallet());
    },
    async init() {
      if (window.ethereum || (window.web3 && window.web3.currentProvider)) {
        this.browserSupported = true;
        const provider = window.ethereum
          ? window.ethereum
          : window.web3.currentProvider;
        await this.connectWallet(provider);
      }

      this.loading = false;
    },
  },
  created() {
    this.init();
  },
});
</script>
