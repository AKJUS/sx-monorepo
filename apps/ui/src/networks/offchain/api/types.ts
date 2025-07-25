import {
  DelegationType,
  SkinSettings,
  SpaceMetadataLabel,
  VoteType
} from '@/types';

export type ApiRelatedSpace = {
  id: string;
  name: string;
  network: string;
  avatar: string;
  cover: string | null;
  proposalsCount: number;
  activeProposals: number;
  votesCount: number;
  turbo: boolean;
  verified: boolean;
};

export type ApiSpace = {
  id: string;
  verified: boolean;
  turbo: boolean;
  turboExpiration: number;
  admins: string[];
  members: string[];
  name: string | null;
  avatar: string | null;
  cover: string | null;
  network: string;
  about: string | null;
  website: string | null;
  twitter: string | null;
  github: string | null;
  farcaster: string | null;
  coingecko: string | null;
  symbol: string;
  activeProposals: number;
  treasuries: {
    name: string;
    network: string;
    address: string;
  }[];
  labels: SpaceMetadataLabel[];
  delegationPortal: {
    delegationType: DelegationType | 'compound-governor';
    delegationContract: string;
    delegationNetwork: string;
    delegationApi: string;
  } | null;
  voting: {
    delay: number | null;
    period: number | null;
    type: VoteType | '' | null;
    quorum: number | null;
    quorumType?: 'default' | 'rejection';
    privacy: '' | 'shutter' | 'any';
    hideAbstain: boolean;
  };
  strategies: { network: string; params: Record<string, any>; name: string }[];
  validation: {
    name: string;
    params: Record<string, any>;
  };
  filters: {
    minScore: number;
    onlyMembers: boolean;
  };
  proposalsCount: number;
  proposalsCount1d: number;
  proposalsCount30d: number;
  votesCount: number;
  followersCount: number;
  children: [ApiRelatedSpace];
  parent: ApiRelatedSpace | null;
  terms: string;
  // properties used for settings
  private: boolean;
  flagged: boolean;
  flagCode: number;
  domain: string | null;
  skin: string | null;
  skinSettings: SkinSettings;
  template: string | null;
  guidelines: string | null;
  categories: string[];
  moderators: string[];
  plugins: Record<string, any>;
  boost: {
    enabled: boolean;
    bribeEnabled: boolean;
  };
  voteValidation: {
    name: string;
    params: Record<string, any>;
  };
};

export type ApiProposal = {
  id: string;
  ipfs: string;
  space: {
    id: string;
    name: string;
    avatar: string;
    network: string;
    admins: string[];
    moderators: string[];
    members: string[];
    symbol: string;
    labels: SpaceMetadataLabel[];
    terms: string;
  };
  type: VoteType;
  title: string;
  body: string;
  discussion: string;
  author: string;
  quorum: number;
  quorumType?: 'default' | 'rejection';
  start: number;
  end: number;
  snapshot: number;
  choices: string[];
  labels: string[];
  scores: number[];
  scores_total: number;
  scores_state: 'invalid' | 'pending' | 'final';
  state: 'active' | 'pending' | 'closed';
  strategies: { network: string; params: Record<string, any>; name: string }[];
  validation: { name: string; params: Record<string, any> };
  created: number;
  updated: number | null;
  votes: number;
  privacy: 'shutter' | '';
  plugins: Record<string, any>;
  flagged: boolean;
  flagCode: number;
};

export type ApiVote = {
  id: string;
  voter: string;
  ipfs: string;
  space: {
    id: string;
  };
  proposal: {
    id: string;
  };
  choice: number | number[] | Record<string, number>;
  vp: number;
  reason: string;
  created: number;
};

export type ApiStrategy = {
  id: string;
  author: string;
  version: string;
  spacesCount: number;
  verifiedSpacesCount: number;
  examples: any;
  schema: any;
};
