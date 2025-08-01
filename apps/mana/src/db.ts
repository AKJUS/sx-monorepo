import knex from './knex';

export const REGISTERED_TRANSACTIONS = 'registered_transactions';
export const REGISTERED_PROPOSALS = 'registered_proposals';
export const MERKLETREE_REQUESTS = 'merkletree_requests';
export const MERKLETREES = 'merkletrees';
export const APEGAS_PROPOSALS = 'apegas_proposals';

export type ApeGasProposal = {
  chainId: number;
  viewId: number;
  snapshot: number;
  herodotusId?: string | null;
  processed?: boolean;
};

export async function registerTransaction(
  network: string,
  type: string,
  sender: string,
  hash: string,
  data: any
) {
  return knex(REGISTERED_TRANSACTIONS)
    .insert({
      network,
      type,
      sender,
      hash,
      data
    })
    .onConflict()
    .ignore();
}

export async function getTransactionsToProcess() {
  return knex(REGISTERED_TRANSACTIONS).select('*').where({ processed: false });
}

export async function markTransactionProcessed(
  id: number,
  { failed = false } = {}
) {
  return knex(REGISTERED_TRANSACTIONS)
    .update({ updated_at: knex.fn.now(), processed: true, failed })
    .where({ id });
}

export async function markOldTransactionsAsProcessed() {
  return knex(REGISTERED_TRANSACTIONS)
    .update({ updated_at: knex.fn.now(), processed: true, failed: true })
    .whereRaw("created_at < now() - interval '1 day'");
}

export async function registerProposal(
  id: string,
  proposal: {
    chainId: string;
    timestamp: number;
    strategyAddress: string;
    herodotusId: string | null;
  }
) {
  return knex(REGISTERED_PROPOSALS).insert({
    id,
    ...proposal
  });
}

export async function updateProposal(
  id: string,
  proposal: { herodotusId: string }
) {
  return knex(REGISTERED_PROPOSALS)
    .update({ updated_at: knex.fn.now(), ...proposal })
    .where({ id });
}

export async function getProposalsToProcess() {
  return knex(REGISTERED_PROPOSALS).select('*').where({ processed: false });
}

export async function markProposalProcessed(id: string) {
  return knex(REGISTERED_PROPOSALS)
    .update({ updated_at: knex.fn.now(), processed: true })
    .where({ id });
}

export async function getProposal(id: string) {
  return knex(REGISTERED_PROPOSALS).select('*').where({ id }).first();
}

export async function getDataByMessageHash(hash: string) {
  return knex(REGISTERED_TRANSACTIONS)
    .select(['sender', 'type', 'data', 'hash', 'network'])
    .where({ hash })
    .first();
}

export async function saveRequest(id: string) {
  await knex(MERKLETREE_REQUESTS).insert({
    id
  });
}

export async function saveMerkleTree(id: string, root: string, tree: string[]) {
  return knex.transaction(async trx => {
    await trx(MERKLETREES)
      .insert({
        id: root,
        tree: JSON.stringify(tree)
      })
      .onConflict()
      .ignore();

    await trx(MERKLETREE_REQUESTS)
      .update({
        processed: true,
        updated_at: knex.fn.now(),
        root
      })
      .where({ id });
  });
}

export async function getMerkleTreeRequest(id: string) {
  return knex(MERKLETREE_REQUESTS).select('*').where({ id }).first();
}

export async function getMerkleTree(id: string) {
  return knex(MERKLETREES).select('*').where({ id }).first();
}

export async function saveApeGasProposal(proposal: ApeGasProposal) {
  return knex(APEGAS_PROPOSALS).insert(proposal).onConflict().ignore();
}

export async function updateApeGasProposal(
  id: string,
  proposal: Partial<ApeGasProposal>
) {
  return knex(APEGAS_PROPOSALS)
    .update({ updated_at: knex.fn.now(), ...proposal })
    .where({ id });
}

export async function getApeGasProposalsToProcess({
  chainId,
  maxSnapshot
}: {
  chainId: number;
  maxSnapshot: number;
}) {
  return knex(APEGAS_PROPOSALS)
    .select('*')
    .where({ chainId, processed: false })
    .andWhere('snapshot', '<=', maxSnapshot);
}
