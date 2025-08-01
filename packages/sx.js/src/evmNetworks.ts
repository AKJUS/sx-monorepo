import { BigNumberish } from '@ethersproject/bignumber';
import { EvmNetworkConfig } from './types';

type AdditionalProperties = {
  maxPriorityFeePerGas?: BigNumberish;
  authenticators?: Record<string, string>;
  strategies?: {
    ApeGas?: string;
  };
  executionStrategies?: {
    Axiom?: string;
    Isokratia?: string;
  };
};

function createStandardConfig(
  eip712ChainId: number,
  additionalProperties: AdditionalProperties = {}
) {
  const additionalAuthenticators = additionalProperties.authenticators || {};
  const additionalStrategies = additionalProperties.strategies || {};
  const additionalExecutionStrategies =
    additionalProperties.executionStrategies || {};

  return {
    Meta: {
      eip712ChainId,
      maxPriorityFeePerGas: additionalProperties.maxPriorityFeePerGas,
      proxyFactory: '0x4B4F7f64Be813Ccc66AEFC3bFCe2baA01188631c',
      masterSpace: '0xC3031A7d3326E47D49BfF9D374d74f364B29CE4D'
    },
    Authenticators: {
      EthSig: '0x5f9B7D78c9a37a439D78f801E0E339C6E711e260',
      EthSigV2: '0x95CF9B585fDb12DeB78002B5643dFF8fe67a496D',
      EthTx: '0xBA06E6cCb877C332181A6867c05c8b746A21Aed1',
      ...additionalAuthenticators
    },
    Strategies: {
      Vanilla: '0xC1245C5DCa7885C73E32294140F1e5d30688c202',
      Comp: '0x0c2De612982Efd102803161fc7C74CcA15Db932c',
      OZVotes: '0x2c8631584474E750CEdF2Fb6A904f2e84777Aefe',
      Whitelist: '0x34f0AfFF5A739bBf3E285615F50e40ddAaf2A829',
      ...additionalStrategies
    },
    ProposalValidations: {
      VotingPower: '0x6D9d6D08EF6b26348Bd18F1FC8D953696b7cf311'
    },
    ExecutionStrategies: {
      SimpleQuorumAvatar: '0xecE4f6b01a2d7FF5A9765cA44162D453fC455e42',
      SimpleQuorumTimelock: '0xf2A1C2f2098161af98b2Cc7E382AB7F3ba86Ebc4',
      Axiom: null,
      Isokratia: null,
      ...additionalExecutionStrategies
    }
  };
}

function createEvmConfig(
  networkId: keyof typeof evmNetworks
): EvmNetworkConfig {
  const network = evmNetworks[networkId];

  const authenticators = {
    [network.Authenticators.EthSig]: {
      type: 'ethSig'
    },
    [network.Authenticators.EthSigV2]: {
      type: 'ethSigV2'
    },
    [network.Authenticators.EthTx]: {
      type: 'ethTx'
    }
  } as const;

  const strategies = {
    [network.Strategies.Vanilla]: {
      type: 'vanilla'
    },
    [network.Strategies.Comp]: {
      type: 'comp'
    },
    [network.Strategies.OZVotes]: {
      type: 'ozVotes'
    },
    [network.Strategies.Whitelist]: {
      type: 'whitelist'
    },
    ...(network.Strategies.ApeGas
      ? {
          [network.Strategies.ApeGas]: {
            type: 'apeGas' as const
          }
        }
      : {})
  } as const;

  const executionStrategiesImplementations = {
    SimpleQuorumAvatar: network.ExecutionStrategies.SimpleQuorumAvatar,
    SimpleQuorumTimelock: network.ExecutionStrategies.SimpleQuorumTimelock,
    ...(network.ExecutionStrategies.Axiom
      ? { Axiom: network.ExecutionStrategies.Axiom }
      : {}),
    ...(network.ExecutionStrategies.Isokratia
      ? { Isokratia: network.ExecutionStrategies.Isokratia }
      : {})
  } as const;

  return {
    eip712ChainId: network.Meta.eip712ChainId,
    maxPriorityFeePerGas: network.Meta.maxPriorityFeePerGas,
    proxyFactory: network.Meta.proxyFactory,
    masterSpace: network.Meta.masterSpace,
    authenticators,
    strategies,
    executionStrategiesImplementations
  };
}

export const evmNetworks = {
  eth: createStandardConfig(1),
  oeth: createStandardConfig(10),
  sep: createStandardConfig(11155111, {
    // executionStrategies: {
    //   Axiom: '0xaC6dbd42Ed254E9407fe0D2798784d0110979DC2',
    //   Isokratia: '0xc674eCf233920aa3052738BFCDbDd0812AEE5A83'
    // }
  }),
  matic: createStandardConfig(137),
  arb1: createStandardConfig(42161),
  base: createStandardConfig(8453),
  mnt: createStandardConfig(5000, {
    // https://docs.mantle.xyz/network/system-information/fee-mechanism/eip-1559-support#application-of-eip-1559-in-mantle-v2-tectonic
    maxPriorityFeePerGas: 0
  }),
  ape: createStandardConfig(33139, {
    strategies: {
      ApeGas: '0xDd6B74123b2aB93aD701320D3F8D1b92B4fA5202'
    }
  }),
  curtis: createStandardConfig(33111, {
    strategies: {
      ApeGas: '0x8E7083D3D0174Fe7f33821b2b4bDFE0fEE9C8e87'
    }
  })
} as const;

export const evmMainnet = createEvmConfig('eth');
export const evmSepolia = createEvmConfig('sep');
export const evmOptimism = createEvmConfig('oeth');
export const evmPolygon = createEvmConfig('matic');
export const evmArbitrum = createEvmConfig('arb1');
export const evmBase = createEvmConfig('base');
export const evmMantle = createEvmConfig('mnt');
export const evmApe = createEvmConfig('ape');
export const evmCurtis = createEvmConfig('curtis');
