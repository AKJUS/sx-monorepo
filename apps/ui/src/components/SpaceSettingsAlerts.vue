<script setup lang="ts">
import { prettyConcat } from '@/helpers/utils';
import { Space } from '@/types';

const props = defineProps<{ space: Space; activeTab: string }>();

const { alerts } = useSpaceAlerts(toRef(props, 'space'));

const unsupportedProOnlyStrategies = computed(
  () =>
    alerts.value
      .get('HAS_PRO_ONLY_STRATEGIES')
      ?.strategies.map((s: string) => `"${s}"`) || []
);

const unsupportedProOnlyNetworks = computed(
  () =>
    alerts.value
      .get('HAS_PRO_ONLY_NETWORKS')
      ?.networks.map((s: any) => `"${s.name}"`) || []
);

const deprecatedStrategies = computed(
  () =>
    alerts.value
      .get('HAS_DEPRECATED_STRATEGIES')
      ?.strategies.map((s: string) => `"${s}"`) || []
);

const hasVotingStrategiesAlerts = computed(
  () =>
    props.activeTab === 'voting-strategies' &&
    (unsupportedProOnlyStrategies.value.length > 0 ||
      deprecatedStrategies.value.length > 0 ||
      unsupportedProOnlyNetworks.value.length > 0)
);

const hasWhitelabelAlerts = computed(
  () =>
    props.activeTab === 'whitelabel' &&
    alerts.value.has('HAS_PRO_ONLY_WHITELABEL')
);

const hasAnyAlerts = computed(
  () => hasVotingStrategiesAlerts.value || hasWhitelabelAlerts.value
);
</script>

<template>
  <div v-if="hasAnyAlerts" class="space-y-2" v-bind="$attrs">
    <template v-if="hasVotingStrategiesAlerts">
      <UiAlert v-if="deprecatedStrategies.length" type="error">
        The {{ prettyConcat(deprecatedStrategies, 'and') }}
        {{ deprecatedStrategies.length > 1 ? 'strategies are' : 'strategy is' }}
        deprecated and no longer supported.
        <AppLink
          to="https://help.snapshot.box/en/articles/11638664-migrating-from-multichain-voting-strategy"
          class="inline-flex items-center"
        >
          See migration guide
          <IH-arrow-sm-right class="-rotate-45" />
        </AppLink>
      </UiAlert>
      <UiAlert v-if="unsupportedProOnlyStrategies.length" type="error">
        The
        {{ prettyConcat(unsupportedProOnlyStrategies, 'and') }}
        {{
          unsupportedProOnlyStrategies.length > 1
            ? 'strategies require'
            : 'strategy requires'
        }}
        Snapshot Pro.
        <AppLink :to="{ name: 'space-pro' }">Upgrade to Pro</AppLink>
        or
        <AppLink
          to="https://help.snapshot.box/en/articles/11568442-migrating-from-delegation-to-with-delegation-strategy"
          class="inline-flex items-center"
        >
          follow migration guide
          <IH-arrow-sm-right class="-rotate-45" />
        </AppLink>
        before August 15, 2025
      </UiAlert>
      <UiAlert v-if="unsupportedProOnlyNetworks.length" type="error">
        The
        {{ prettyConcat(unsupportedProOnlyNetworks, 'and') }}
        {{ unsupportedProOnlyNetworks.length > 1 ? 'networks' : 'network' }}
        used by your space and/or its strategies require{{
          unsupportedProOnlyNetworks.length > 1 ? '' : 's'
        }}
        Snapshot Pro.
        <AppLink :to="{ name: 'space-pro' }">Upgrade to Pro</AppLink>
        or
        <AppLink
          to="https://help.snapshot.box/en/articles/10478752-what-are-the-premium-networks"
          class="inline-flex items-center"
        >
          change to a premium network
          <IH-arrow-sm-right class="-rotate-45" />
        </AppLink>
        before August 15, 2025
      </UiAlert>
    </template>
    <template v-if="hasWhitelabelAlerts">
      <UiAlert type="error">
        Custom domain requires Snapshot Pro.
        <AppLink :to="{ name: 'space-pro' }">Upgrade to Pro</AppLink>
        or
        <AppLink
          to="https://help.snapshot.box/en/articles/11661865-migrating-from-using-a-whitelabel"
          class="inline-flex items-center"
        >
          follow migration guide
          <IH-arrow-sm-right class="-rotate-45" />
        </AppLink>
        before August 15, 2025
      </UiAlert>
    </template>
  </div>
</template>
