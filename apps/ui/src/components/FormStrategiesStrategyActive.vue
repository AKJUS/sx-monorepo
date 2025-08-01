<script setup lang="ts">
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getUrl, shorten } from '@/helpers/utils';
import { getNetwork, offchainNetworks } from '@/networks';
import { StrategyConfig } from '@/networks/types';
import { NetworkID } from '@/types';

type Networks = typeof networks;
type NetworkDetails = Networks[keyof Networks];

type Strategy = Pick<
  StrategyConfig,
  | 'id'
  | 'address'
  | 'name'
  | 'chainId'
  | 'params'
  | 'generateSummary'
  | 'paramsDefinition'
>;

const props = defineProps<{
  readOnly?: boolean;
  networkId: NetworkID;
  strategy: Strategy;
  showTestButton?: boolean;
}>();

defineEmits<{
  (e: 'editStrategy', strategy: Strategy);
  (e: 'deleteStrategy', strategy: Strategy);
  (e: 'testStrategies', strategies: StrategyConfig[]);
}>();

const network = computed(() => getNetwork(props.networkId));
const hasAddress = computed(() => props.strategy.address.startsWith('0x'));
const strategyNetworkDetails = computed<NetworkDetails>(() => {
  if (!props.strategy.chainId) return null;
  if (!(props.strategy.chainId in networks)) return null;

  return networks[props.strategy.chainId];
});
const isOffchainNetwork = computed(() => {
  return offchainNetworks.includes(props.networkId);
});
</script>

<template>
  <div class="rounded-lg border px-4 py-3 text-skin-link leading-[18px]">
    <div class="flex justify-between items-center gap-1">
      <div class="flex min-w-0">
        <div class="whitespace-nowrap truncate">{{ strategy.name }}</div>
        <div
          v-if="strategy.generateSummary"
          class="ml-2 pr-2 text-skin-text truncate"
        >
          {{ strategy.generateSummary(strategy.params) }}
        </div>
      </div>
      <div v-if="!readOnly" class="flex gap-3">
        <button
          v-if="strategy.paramsDefinition || isOffchainNetwork"
          type="button"
          @click="$emit('editStrategy', strategy)"
        >
          <IH-pencil />
        </button>
        <button
          v-if="showTestButton"
          type="button"
          @click="$emit('testStrategies', [strategy])"
        >
          <IH-play />
        </button>
        <a
          v-if="!hasAddress"
          :href="network.helpers.getExplorerUrl(strategy.address, 'strategy')"
          target="_blank"
          class="text-skin-link"
        >
          <IH-information-circle />
        </a>
        <button type="button" @click="$emit('deleteStrategy', strategy)">
          <IH-trash />
        </button>
      </div>
    </div>
    <a
      v-if="hasAddress"
      :href="network.helpers.getExplorerUrl(strategy.address, 'contract')"
      target="_blank"
      class="flex items-center text-skin-text leading-5 mt-1"
    >
      <UiStamp
        :id="strategy.address"
        type="avatar"
        :size="18"
        class="mr-2 !rounded"
      />
      {{ shorten(strategy.address) }}
      <IH-arrow-sm-right class="-rotate-45" />
    </a>
    <div class="flex flex-col gap-2 mt-3 empty:mt-0">
      <div
        v-if="strategyNetworkDetails"
        class="flex gap-2 justify-between items-center overflow-hidden"
      >
        <span class="font-medium">Network</span>
        <div class="flex gap-1 items-center">
          <img
            :src="getUrl(strategyNetworkDetails.logo) || undefined"
            class="size-3 rounded-full"
          />
          <span class="text-skin-text truncate">
            {{ strategyNetworkDetails.name }}
          </span>
        </div>
      </div>
      <div
        v-if="strategy.params.symbol"
        class="flex gap-2 justify-between items-center"
      >
        <span class="font-medium">Symbol</span>
        <span class="text-skin-text">
          {{ shorten(strategy.params.symbol, 'symbol') }}
        </span>
      </div>
    </div>
  </div>
</template>
