<script setup lang="ts">
import draggable from 'vuedraggable';

const followedSpacesStore = useFollowedSpacesStore();
</script>

<template>
  <div class="flex flex-col border-r text-center">
    <AppLink :to="{ name: 'my-home' }" class="h-[72px] block">
      <IC-zap class="inline-block my-[18px] size-[40px] text-skin-link" />
    </AppLink>
    <div
      class="bg-gradient-to-b from-skin-bg top-[72px] h-[8px] w-[71px] absolute z-10"
    />
    <UiLoading v-if="!followedSpacesStore.followedSpacesLoaded" />
    <draggable
      v-else
      v-model="followedSpacesStore.followedSpaces"
      :delay="100"
      :delay-on-touch-only="true"
      :touch-start-threshold="35"
      :item-key="i => i"
      v-bind="{ animation: 200 }"
      class="space-y-3 p-2 no-scrollbar overscroll-contain overflow-auto pb-3"
    >
      <template #item="{ element }">
        <AppLink
          :to="{
            name: 'space-overview',
            params: { space: `${element.network}:${element.id}` }
          }"
          class="block"
        >
          <UiTooltip :title="element.name" placement="right">
            <SpaceAvatar
              show-active-proposals
              :space="element"
              :size="32"
              class="!rounded-[4px]"
            />
          </UiTooltip>
        </AppLink>
      </template>
    </draggable>
  </div>
</template>
