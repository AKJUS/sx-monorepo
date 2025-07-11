import { getAddress } from '@ethersproject/address';
import { Contract as EthContract } from '@ethersproject/contracts';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { validateAndParseAddress } from 'starknet';
import L1AvatarExectionStrategyAbi from './abis/l1/L1AvatarExectionStrategy.json';
import { FullConfig } from './config';
import {
  ExecutionStrategy,
  SpaceMetadataItem,
  StrategiesParsedMetadataDataItem
} from '../../.checkpoint/models';
import { dropIpfs, getJSON, getSpaceName } from '../common/utils';

export async function handleSpaceMetadata(
  space: string,
  metadataUri: string,
  config: FullConfig
) {
  const exists = await SpaceMetadataItem.loadEntity(
    dropIpfs(metadataUri),
    config.indexerName
  );
  if (exists) return;

  const spaceMetadataItem = new SpaceMetadataItem(
    dropIpfs(metadataUri),
    config.indexerName
  );
  spaceMetadataItem.name = getSpaceName(space);
  spaceMetadataItem.about = '';
  spaceMetadataItem.avatar = '';
  spaceMetadataItem.cover = '';
  spaceMetadataItem.external_url = '';
  spaceMetadataItem.github = '';
  spaceMetadataItem.twitter = '';
  spaceMetadataItem.discord = '';
  spaceMetadataItem.farcaster = '';
  spaceMetadataItem.voting_power_symbol = '';
  spaceMetadataItem.wallet = '';
  spaceMetadataItem.executors = [];
  spaceMetadataItem.executors_strategies = [];
  spaceMetadataItem.executors_types = [];
  spaceMetadataItem.executors_destinations = [];
  spaceMetadataItem.treasuries = [];
  spaceMetadataItem.labels = [];
  spaceMetadataItem.delegations = [];

  const metadata: any = metadataUri ? await getJSON(metadataUri) : {};

  if (metadata.name) spaceMetadataItem.name = metadata.name;
  if (metadata.description) spaceMetadataItem.about = metadata.description;
  if (metadata.avatar) spaceMetadataItem.avatar = metadata.avatar;
  if (metadata.external_url)
    spaceMetadataItem.external_url = metadata.external_url;

  if (metadata.properties) {
    if (metadata.properties.cover)
      spaceMetadataItem.cover = metadata.properties.cover;

    if (metadata.properties.treasuries) {
      spaceMetadataItem.treasuries = metadata.properties.treasuries.map(
        (treasury: any) => JSON.stringify(treasury)
      );
    }
    if (metadata.properties.labels) {
      spaceMetadataItem.labels = metadata.properties.labels.map((label: any) =>
        JSON.stringify(label)
      );
    }
    if (metadata.properties.delegations) {
      spaceMetadataItem.delegations = metadata.properties.delegations.map(
        (delegation: any) => JSON.stringify(delegation)
      );
    }
    if (metadata.properties.github)
      spaceMetadataItem.github = metadata.properties.github;
    if (metadata.properties.twitter)
      spaceMetadataItem.twitter = metadata.properties.twitter;
    if (metadata.properties.discord)
      spaceMetadataItem.discord = metadata.properties.discord;
    if (metadata.properties.farcaster)
      spaceMetadataItem.farcaster = metadata.properties.farcaster;
    if (metadata.properties.voting_power_symbol) {
      spaceMetadataItem.voting_power_symbol =
        metadata.properties.voting_power_symbol;
    }
    if (
      metadata.properties.execution_strategies &&
      metadata.properties.execution_strategies_types
    ) {
      // In Starknet execution strategies are not always deployed via proxy (e.g. EthRelayer).
      // We have to intercept it there and create single use proxy for it.
      const destinations: string[] = [];
      const uniqueExecutors: string[] = [];
      for (
        let i = 0;
        i < metadata.properties.execution_strategies.length;
        i++
      ) {
        const id = crypto.randomUUID();
        const destination =
          (metadata.properties.execution_destinations?.[i] as string) ?? '';

        destinations.push(destination);
        uniqueExecutors.push(id);

        let executionStrategy = await ExecutionStrategy.loadEntity(
          id,
          config.indexerName
        );
        if (!executionStrategy)
          executionStrategy = new ExecutionStrategy(id, config.indexerName);

        executionStrategy.type =
          metadata.properties.execution_strategies_types[i];
        executionStrategy.address = validateAndParseAddress(
          metadata.properties.execution_strategies[i]
        );
        executionStrategy.quorum = '0';
        executionStrategy.timelock_delay = 0n;

        if (executionStrategy.type === 'EthRelayer') {
          const l1Destination = getAddress(destination);

          const ethProvider = new StaticJsonRpcProvider(
            config.overrides.l1NetworkNodeUrl,
            config.overrides.baseChainId
          );

          const l1AvatarExecutionStrategyContract = new EthContract(
            l1Destination,
            L1AvatarExectionStrategyAbi,
            ethProvider
          );

          const quorum = (
            await l1AvatarExecutionStrategyContract.quorum()
          ).toBigInt();
          const treasury = await l1AvatarExecutionStrategyContract.target();

          executionStrategy.destination_address = l1Destination;
          executionStrategy.quorum = quorum;
          executionStrategy.treasury = treasury;
          executionStrategy.treasury_chain = config.overrides.baseChainId;
        }

        await executionStrategy.save();
      }

      spaceMetadataItem.executors =
        metadata.properties.execution_strategies.map((strategy: string) =>
          validateAndParseAddress(strategy)
        );
      spaceMetadataItem.executors_strategies = uniqueExecutors;
      spaceMetadataItem.executors_destinations = destinations;
      spaceMetadataItem.executors_types =
        metadata.properties.execution_strategies_types;
    }
  }

  await spaceMetadataItem.save();
}

export async function handleStrategiesParsedMetadata(
  metadataUri: string,
  config: FullConfig
) {
  const exists = await StrategiesParsedMetadataDataItem.loadEntity(
    dropIpfs(metadataUri),
    config.indexerName
  );
  if (exists) return;

  const strategiesParsedMetadataItem = new StrategiesParsedMetadataDataItem(
    dropIpfs(metadataUri),
    config.indexerName
  );

  const metadata: any = await getJSON(metadataUri);
  if (metadata.name) strategiesParsedMetadataItem.name = metadata.name;
  if (metadata.description)
    strategiesParsedMetadataItem.description = metadata.description;

  if (metadata.properties) {
    if (metadata.properties.decimals) {
      strategiesParsedMetadataItem.decimals = metadata.properties.decimals;
    }
    if (metadata.properties.symbol) {
      strategiesParsedMetadataItem.symbol = metadata.properties.symbol;
    }
    if (metadata.properties.token)
      strategiesParsedMetadataItem.token = metadata.properties.token;
    if (metadata.properties.payload) {
      strategiesParsedMetadataItem.payload = metadata.properties.payload;
    }
  }

  await strategiesParsedMetadataItem.save();
}
