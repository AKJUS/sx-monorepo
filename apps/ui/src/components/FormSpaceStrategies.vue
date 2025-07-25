<script setup lang="ts">
import { StrategyConfig } from '@/networks/types';
import { NetworkID, Space } from '@/types';

const snapshotChainId = defineModel<string>('snapshotChainId', {
  required: true
});
const strategies = defineModel<StrategyConfig[]>('strategies', {
  required: true
});

const props = defineProps<{
  networkId: NetworkID;
  isTicketValid: boolean;
  space: Space;
}>();

const { limits } = useSettings();

const isTestStrategiesModalOpen = ref(false);
const testedStrategies: Ref<StrategyConfig[]> = ref([]);

const strategiesLimit = computed(() => {
  const spaceType = props.space.turbo
    ? 'turbo'
    : props.space.verified
      ? 'verified'
      : 'default';

  return limits.value[`space.${spaceType}.strategies_limit`];
});

function handleTestStrategies(strategies: StrategyConfig[]) {
  testedStrategies.value = strategies;
  isTestStrategiesModalOpen.value = true;
}
</script>

<template>
  <h4 class="eyebrow mb-2 font-medium">Strategies</h4>
  <div class="s-box">
    <UiSelectorNetwork
      v-model="snapshotChainId"
      :definition="{
        type: 'number',
        title: 'Network',
        tooltip:
          'The default network used for this space. Networks can also be specified in individual strategies',
        examples: ['Select network'],
        networkId,
        networksListKind: 'full'
      }"
    />
  </div>
  <UiContainerSettings
    :title="`Select up to ${strategiesLimit} strategies`"
    description="(Voting power is cumulative)"
    class="!mx-0"
  >
    <template #actions>
      <UiTooltip title="Test all custom strategies">
        <UiButton
          class="!p-0 !border-0 !h-auto !w-[20px]"
          :disabled="!strategies.length"
          @click="handleTestStrategies(strategies)"
        >
          <IH-play />
        </UiButton>
      </UiTooltip>
    </template>
    <UiMessage
      v-if="!isTicketValid"
      type="danger"
      learn-more-link="https://snapshot.mirror.xyz/-uSylOUP82hGAyWUlVn4lCg9ESzKX9QCvsUgvv-ng84"
      class="mb-3"
    >
      In order to use the "ticket" strategy you are required to set a voting
      validation strategy. This combination reduces the risk of spam and sybil
      attacks.
    </UiMessage>
    <UiStrategiesConfiguratorOffchain
      v-model:model-value="strategies"
      :network-id="networkId"
      :default-chain-id="snapshotChainId"
      :limit="strategiesLimit"
      :space-id="space.id"
      :voting-power-symbol="space.voting_power_symbol"
      @test-strategies="handleTestStrategies"
    />
  </UiContainerSettings>
  <teleport to="#modal">
    <ModalTestStrategy
      :open="isTestStrategiesModalOpen"
      :network-id="networkId"
      :chain-id="space.snapshot_chain_id"
      :space-id="space.id"
      :voting-power-symbol="space.voting_power_symbol"
      :strategies="testedStrategies"
      @close="isTestStrategiesModalOpen = false"
    />
  </teleport>
</template>
