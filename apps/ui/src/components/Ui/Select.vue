<script setup lang="ts" generic="T extends string | number">
import { DefinitionWithOptions } from '@/types';

const model = defineModel<T>({ required: true });

const props = defineProps<{
  error?: string;
  required?: boolean;
  definition: DefinitionWithOptions<T>;
  disabled?: boolean;
}>();

const dirty = ref(false);

const inputValue = computed({
  get() {
    if (!model.value && !dirty.value && props.definition.default) {
      return props.definition.default;
    }

    return model.value;
  },
  set(newValue: T) {
    dirty.value = true;
    model.value = newValue;
  }
});

watch(model, () => {
  dirty.value = true;
});
</script>

<template>
  <UiWrapperInput
    :definition="definition"
    :error="error"
    :dirty="dirty"
    :required="required"
  >
    <select v-model="inputValue" class="s-input" :disabled="disabled">
      <option disabled value="">Please select one</option>
      <option
        v-for="option in definition.options"
        :key="option.id"
        :value="option.id"
      >
        {{ option.name ?? option.id }}
      </option>
    </select>
  </UiWrapperInput>
</template>

<style lang="scss" scoped>
select:disabled {
  @apply cursor-not-allowed opacity-100;
}
</style>
