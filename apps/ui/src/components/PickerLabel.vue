<script setup lang="ts">
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Popover,
  PopoverButton,
  PopoverPanel
} from '@headlessui/vue';
import { SpaceMetadataLabel } from '@/types';

const props = defineProps<{
  labels: SpaceMetadataLabel[];
  buttonProps?: Record<string, any>;
  panelProps?: Record<string, any>;
}>();

defineSlots<{
  button(props: { close: () => void }): any;
}>();

const selectedLabels = defineModel<string[]>({
  required: true
});

const searchValue = ref('');

const filteredLabels = computed(() =>
  props.labels.filter(label => {
    const search = searchValue.value.toLowerCase();
    return (
      label.name.toLowerCase().includes(search) ||
      label.description.toLowerCase().includes(search)
    );
  })
);
</script>

<template>
  <Popover v-slot="{ open, close }" class="relative contents">
    <PopoverButton
      class="w-full"
      :class="open ? 'text-skin-link' : 'text-skin-text'"
      v-bind="buttonProps"
    >
      <slot name="button" :close="close">
        <IH-pencil />
      </slot>
    </PopoverButton>
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <PopoverPanel
        focus
        class="absolute z-[11] left-0 -mt-2 mx-4 pb-3"
        style="width: calc(100% - 48px)"
        v-bind="panelProps"
      >
        <Combobox
          v-slot="{ activeOption }"
          v-model="selectedLabels"
          multiple
          nullable
        >
          <div class="bg-skin-bg rounded-xl overflow-hidden shadow-bottom">
            <div
              class="flex items-center px-3 py-[14px] bg-skin-border border-b border-skin-heading border-opacity-5"
            >
              <IH-search class="mr-2" />
              <ComboboxInput
                class="flex-auto bg-transparent text-skin-link"
                as="input"
                placeholder="Search"
                :value="searchValue"
                @change="searchValue = $event.target.value"
              />
            </div>
            <div class="max-h-[345px] overflow-auto no-scrollbar">
              <ComboboxOptions static hold>
                <ComboboxOption
                  v-for="label in filteredLabels"
                  :key="label.id"
                  :value="label.id"
                  class="flex justify-between items-center bg-skin-border px-3 py-[11.5px] cursor-pointer w-full"
                  :class="activeOption === label.id ? 'bg-opacity-70' : ''"
                >
                  <div class="w-11/12">
                    <UiProposalLabel
                      :label="label.name || 'label preview'"
                      :color="label.color"
                    />
                    <div
                      v-if="label.description"
                      class="mt-2 truncate leading-[18px] text-sm"
                      v-text="label.description"
                    />
                  </div>
                  <div v-if="selectedLabels.includes(label.id)">
                    <IH-check class="text-skin-success" />
                  </div>
                </ComboboxOption>
              </ComboboxOptions>
            </div>
          </div>
        </Combobox>
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<style lang="scss" scoped>
.shadow-bottom {
  box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>
