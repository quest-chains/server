import { CAR, DID, Delegation } from '@ucanto/core';
import * as Signer from '@ucanto/principal/ed25519';
import { StoreMemory } from '@web3-storage/access/stores/store-memory';
import * as Client from '@web3-storage/w3up-client';

if (
  !process.env.WEB3_STORAGE_KEY ||
  !process.env.WEB3_STORAGE_PROOF ||
  !process.env.WEB3_STORAGE_DID
) {
  throw new Error(
    'WEB3_STORAGE_KEY, WEB3_STORAGE_PROOF, and WEB3_STORAGE_DID must be set'
  );
}

const { WEB3_STORAGE_KEY, WEB3_STORAGE_PROOF, WEB3_STORAGE_DID } = process.env;
const WEB3_STORAGE_SPACE: string = 'metagame';

const principal = Signer.parse(WEB3_STORAGE_KEY);

// data is a Base64 encoded CAR file
const parseProof = (data: string) => {
  const car = CAR.decode(Buffer.from(data, 'base64'));
  return Delegation.importDAG(car.blocks.values());
};

const initClient = async () => {
  // Add proof that this agent has been delegated capabilities on the space
  const client = await Client.create({ principal, store: new StoreMemory() });
  const space = client.spaces().find(s => s.name === WEB3_STORAGE_SPACE);
  if (space) {
    client.setCurrentSpace(space.did());
    return client;
  }

  const proof = parseProof(WEB3_STORAGE_PROOF);
  const newSpace = await client.addSpace(proof);
  await client.setCurrentSpace(newSpace.did());
  return client;
};

const delegate = async (did: string) => {
  // Create a delegation for a specific DID
  const audience = DID.parse(did);
  const client = await initClient();
  const delegation = await client.createDelegation(
    audience,
    ['store/add', 'upload/add', 'upload/remove', 'store/remove'],
    { lifetimeInSeconds: 60 * 60 * 24 }
  );

  // Serializing the delegation before sending it to the client
  await delegation.archive();

  return client;
};

export const w3upClient: Promise<Client.Client> = delegate(WEB3_STORAGE_DID);
