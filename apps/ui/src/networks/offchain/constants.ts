import { VoteType } from '@/types';
import { ConnectorType } from '../types';

export const AUTHS = {};
export const PROPOSAL_VALIDATIONS = {
  any: 'Any',
  basic: 'Basic',
  'passport-gated': 'Passport gated',
  'karma-eas-attestation': 'Karma EAS Attestation',
  'only-members': 'Only members'
};
export const STRATEGIES = {};
export const EXECUTORS = {};
export const CONNECTORS: ConnectorType[] = [
  'injected',
  'walletconnect',
  'coinbase',
  'gnosis',
  'sequence',
  'guest',
  'argentx'
];
export const EDITOR_AUTHENTICATORS = [];
export const EDITOR_PROPOSAL_VALIDATIONS = [];
export const EDITOR_VOTING_STRATEGIES = [];
export const EDITOR_PROPOSAL_VALIDATION_VOTING_STRATEGIES = [];
export const EDITOR_EXECUTION_STRATEGIES = [];
export const EDITOR_SNAPSHOT_OFFSET = 4;
export const EDITOR_VOTING_TYPES: VoteType[] = [
  'basic',
  'single-choice',
  'approval',
  'ranked-choice',
  'copeland',
  'weighted',
  'quadratic'
];
