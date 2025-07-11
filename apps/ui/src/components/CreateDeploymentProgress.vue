<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { getNetwork } from '@/networks';
import { Connector, ConnectorType, StrategyConfig } from '@/networks/types';
import { NetworkID, SpaceMetadata, SpaceSettings } from '@/types';

type DeployingDependencyStep = {
  id: `DEPLOYING_DEPS_${number}`;
  title: string;
  strategy: StrategyConfig;
};

type AddingDependencyStep = {
  id: 'ADDING_DEPS';
  strategy: StrategyConfig;
};

type DeployingSpaceStep = {
  id: 'DEPLOYING_SPACE';
  title: string;
};

type IndexingSpaceStep = {
  id: 'INDEXING_SPACE';
  title: string;
};

type Step =
  | DeployingDependencyStep
  | AddingDependencyStep
  | DeployingSpaceStep
  | IndexingSpaceStep;

const props = defineProps<{
  networkId: NetworkID;
  salt: string;
  predictedSpaceAddress: string;
  metadata: SpaceMetadata;
  settings: SpaceSettings;
  authenticators: StrategyConfig[];
  validationStrategy: StrategyConfig;
  votingStrategies: StrategyConfig[];
  executionStrategies: StrategyConfig[];
  controller: string;
}>();

const emit = defineEmits<{
  (e: 'back');
}>();

const { deployDependency, createSpace } = useActions();
const { login, auth } = useWeb3();

const currentStep = ref(0);
const completed = ref(false);
const failed = ref(false);
const connectorModalOpen = ref(false);
const connectorModalConnectors = ref([] as ConnectorType[]);
const connectorCallbackFn: Ref<((value: Connector | false) => void) | null> =
  ref(null);
const txIds = ref({});
const deployedExecutionStrategies = ref([] as StrategyConfig[]);
const executionStrategiesDestinations = ref([] as string[]);

const network = computed(() => getNetwork(props.networkId));
const steps = computed<Step[]>(() => {
  return [
    ...props.executionStrategies.map((config, i) => {
      if (!config.deploy) {
        return {
          id: 'ADDING_DEPS' as const,
          strategy: config
        };
      }

      const title = config.type
        ? `Deploying ${network.value.constants.EXECUTORS[config.type]} execution strategy`
        : 'Deploying dependency';

      return {
        id: `DEPLOYING_DEPS_${i}` as const,
        title,
        strategy: config
      };
    }),
    {
      id: 'DEPLOYING_SPACE',
      title: 'Deploying space'
    },
    {
      id: 'INDEXING_SPACE',
      title: 'Indexing space'
    }
  ];
});

const uiSteps = computed(() => {
  return steps.value.filter(step => step.id !== 'ADDING_DEPS') as Exclude<
    Step,
    AddingDependencyStep
  >[];
});

function getConnector(supportedConnectors: ConnectorType[]) {
  connectorModalOpen.value = true;
  connectorModalConnectors.value = supportedConnectors;

  return new Promise<Connector | false>(resolve => {
    connectorCallbackFn.value = resolve;
  });
}

function handleConnectorPick(connector: Connector) {
  connectorCallbackFn.value?.(connector);
  connectorModalOpen.value = false;
}

function handleConnectorClose() {
  connectorCallbackFn.value?.(false);
  connectorModalOpen.value = false;
}

async function deployStep(
  step: DeployingDependencyStep | AddingDependencyStep | DeployingSpaceStep
) {
  if (step.id === 'ADDING_DEPS') {
    deployedExecutionStrategies.value.push(step.strategy);
    executionStrategiesDestinations.value.push('');
    return;
  }

  const supportedConnectors =
    'strategy' in step && step.strategy.deployConnectors
      ? step.strategy.deployConnectors
      : network.value.managerConnectors;

  if (!auth.value || !supportedConnectors.includes(auth.value.connector.type)) {
    const selectedConnector = await getConnector(supportedConnectors);
    if (!selectedConnector) throw new Error('No connector selected');

    await login(selectedConnector);
  }

  let result;
  if (step.id === 'DEPLOYING_SPACE') {
    const executionStrategies = deployedExecutionStrategies.value;
    const executionDestinations = executionStrategiesDestinations.value;

    result = await createSpace(
      props.networkId,
      props.salt,
      props.metadata,
      props.settings,
      props.authenticators,
      props.validationStrategy,
      props.votingStrategies,
      executionStrategies,
      executionDestinations,
      props.controller
    );
  } else {
    result = await deployDependency(
      props.networkId,
      props.controller,
      props.predictedSpaceAddress,
      step.strategy
    );
  }

  if (!result) {
    failed.value = true;
    return;
  }

  const { address, txId }: { address: string; txId: string } = result;

  txIds.value[step.id] = txId;
  const stepNetwork = getStepNetwork(step);
  const confirmedReceipt = await stepNetwork.helpers.waitForTransaction(txId);
  if (confirmedReceipt.status === 0) throw new Error('Transaction failed');

  if (step.id !== 'DEPLOYING_SPACE') {
    const isCrosschainDeploy = step.strategy.address !== '';
    const destination = isCrosschainDeploy ? address : '';
    const strategy = isCrosschainDeploy
      ? step.strategy
      : { ...step.strategy, deploy: undefined, address };

    executionStrategiesDestinations.value.push(destination);
    deployedExecutionStrategies.value.push(strategy);
  }

  currentStep.value = currentStep.value + 1;
}

async function deploy(startIndex: number = 0) {
  failed.value = false;

  const stepsToProcess = steps.value.slice(startIndex);

  for (const step of stepsToProcess) {
    if (step.id === 'INDEXING_SPACE') continue;

    try {
      await deployStep(step);
    } catch (e) {
      console.log('e', e);
      failed.value = true;
      return;
    }
  }

  try {
    await network.value.helpers.waitForSpace(props.predictedSpaceAddress);

    completed.value = true;
    currentStep.value = currentStep.value + 1;
  } catch {
    failed.value = true;
  }
}

function getStepNetwork(step: Step) {
  if ('strategy' in step && step.strategy.deployNetworkId) {
    return getNetwork(step.strategy.deployNetworkId);
  }

  return network.value;
}

onMounted(() => deploy());
</script>

<template>
  <div class="pt-5 max-w-[50rem] mx-auto px-4">
    <h1>Create new space</h1>
    <div>Do not refresh this page until process is complete.</div>

    <div class="flex flex-col mt-4">
      <div
        v-for="(step, i) in uiSteps"
        :key="step.id"
        class="flex items-center gap-4 mb-3 last:mb-0"
      >
        <div>
          <IH-check v-if="i < currentStep" class="text-skin-success" />
          <IH-clock v-else-if="i > currentStep" />
          <template v-else>
            <UiLoading v-if="!failed" />
            <IH-exclamation-circle v-else class="text-skin-danger" />
          </template>
        </div>
        <div>
          <h4 v-text="step.title" />
          <button
            v-if="failed && i === currentStep"
            type="button"
            class="text-skin-text"
            @click="deploy(currentStep)"
          >
            Retry
          </button>
          <a
            v-if="txIds[step.id]"
            class="inline-flex items-center"
            target="_blank"
            :href="
              getStepNetwork(step).helpers.getExplorerUrl(
                txIds[step.id],
                'transaction'
              )
            "
          >
            {{ shorten(txIds[step.id]) }}
            <IH-arrow-sm-right class="inline-block ml-1 -rotate-45" />
          </a>
        </div>
      </div>
    </div>
    <UiButton
      v-if="!completed && steps[currentStep].id !== 'INDEXING_SPACE'"
      class="mt-4"
      @click="emit('back')"
    >
      Go back
    </UiButton>
    <div v-if="completed" class="mt-4">
      You can now access your space
      <AppLink
        :to="{
          name: 'space-overview',
          params: { space: `${networkId}:${predictedSpaceAddress}` }
        }"
        text="here"
      />.
    </div>
  </div>
  <ModalConnector
    :open="connectorModalOpen"
    :supported-connectors="connectorModalConnectors"
    @close="handleConnectorClose"
    @pick="handleConnectorPick"
  />
</template>
