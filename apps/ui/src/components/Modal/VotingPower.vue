<script setup lang="ts">
import { _n, shorten } from '@/helpers/utils';
import { addressValidator as isValidAddress } from '@/helpers/validation';
import { getNetwork } from '@/networks';
import { VotingPowerItem } from '@/stores/votingPowers';
import { NetworkID } from '@/types';

const props = defineProps<{
  open: boolean;
  networkId: NetworkID;
  votingPower?: VotingPowerItem;
}>();

defineEmits<{
  (e: 'close');
  (e: 'fetchVotingPower');
}>();

const network = computed(() => getNetwork(props.networkId));
const baseNetwork = computed(() =>
  network.value.baseNetworkId
    ? getNetwork(network.value.baseNetworkId)
    : network.value
);
const loading = computed(
  () => !props.votingPower || props.votingPower.status === 'loading'
);
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>Your voting power</h3>
    </template>
    <UiLoading v-if="loading" class="p-4 block text-center" />
    <div v-else-if="votingPower">
      <MessageErrorFetchPower
        v-if="votingPower.status === 'error'"
        type="voting"
        class="p-4"
        @fetch="$emit('fetchVotingPower')"
      />
      <div
        v-for="(strategy, i) in votingPower.votingPowers"
        :key="i"
        class="py-3 px-4 border-b last:border-b-0"
      >
        <div class="flex justify-between">
          <a
            :href="network.helpers.getExplorerUrl(strategy.address, 'strategy')"
            target="_blank"
            class="truncate"
            v-text="
              network.constants.STRATEGIES[strategy.address] ||
              (isValidAddress(strategy.address)
                ? shorten(strategy.address)
                : strategy.address)
            "
          />
          <div class="text-skin-link shrink-0">
            {{
              _n(
                Number(strategy.value) / 10 ** strategy.cumulativeDecimals,
                'compact',
                {
                  maximumFractionDigits: 2,
                  formatDust: true
                }
              )
            }}
            {{ votingPower.symbol }}
          </div>
        </div>
        <div class="flex justify-between">
          <div v-if="strategy.token" class="flex items-center gap-2">
            <a
              :href="
                (network.constants.STORAGE_PROOF_STRATEGIES_TYPES?.includes(
                  strategy.address
                )
                  ? baseNetwork
                  : network
                ).helpers.getExplorerUrl(
                  strategy.token,
                  'contract',
                  strategy.chainId
                )
              "
              target="_blank"
              class="flex items-center text-skin-text"
            >
              <UiStamp
                :id="strategy.token"
                type="avatar"
                :size="18"
                class="mr-2 rounded-sm"
              />
              {{ shorten(strategy.token) }}
              <IH-arrow-sm-right class="ml-1 -rotate-45" />
            </a>
            <a
              v-if="strategy.swapLink"
              :href="strategy.swapLink"
              target="_blank"
              class="flex items-center text-skin-text"
            >
              Buy
              <IH-arrow-sm-right class="ml-1 -rotate-45" />
            </a>
          </div>
          <div v-else />
          <div>
            {{ _n(Number(strategy.value) / 10 ** strategy.displayDecimals) }}
            {{ strategy.symbol || 'units' }}
          </div>
        </div>
      </div>
    </div>
  </UiModal>
</template>
