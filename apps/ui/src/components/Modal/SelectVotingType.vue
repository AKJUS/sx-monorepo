<script setup lang="ts">
import { VOTING_TYPES_INFO } from '@/helpers/constants';
import { VoteType } from '@/types';

type AvailableVotingTypes = 'any' | VoteType;

const props = withDefaults(
  defineProps<{
    open: boolean;
    withAny?: boolean;
    initialState?: AvailableVotingTypes;
    votingTypes: AvailableVotingTypes[];
  }>(),
  {
    withAny: false
  }
);

const emit = defineEmits<{
  (e: 'save', type: AvailableVotingTypes);
  (e: 'close');
}>();

const availableVotingTypes = computed(() =>
  props.withAny ? (['any', ...props.votingTypes] as const) : props.votingTypes
);

function handleSelect(type: AvailableVotingTypes) {
  emit('save', type);
  emit('close');
}
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>Select voting system</h3>
    </template>
    <div class="p-4 flex flex-col gap-2.5">
      <UiSelector
        v-for="(type, index) in availableVotingTypes"
        :key="index"
        :is-active="initialState === type"
        @click="handleSelect(type)"
      >
        <div>
          <h4
            class="text-skin-link inline"
            v-text="VOTING_TYPES_INFO[type].label"
          />
          <span
            v-if="VOTING_TYPES_INFO[type].isBeta"
            class="ml-2 bg-skin-border text-skin-link text-[13px] rounded-full px-1.5 py-0.5"
            >beta</span
          >
          <div v-text="VOTING_TYPES_INFO[type].description" />
        </div>
      </UiSelector>
    </div>
  </UiModal>
</template>
