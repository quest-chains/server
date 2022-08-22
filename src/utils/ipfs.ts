import IPFSClient from 'ipfs-http-client';
import { Readable } from 'stream';
import { Web3Storage } from 'web3.storage';

import { WEB3_STORAGE_TOKEN } from '@/utils/constants';

// the graph's hosted network ipfs node works best with ipfs-http-client 34.0.0
const ipfsTheGraph = new IPFSClient({
  protocol: 'https',
  host: 'api.thegraph.com',
  port: 443,
  'api-path': '/ipfs/api/v0/'
});

const web3Storage = new Web3Storage({
  token: WEB3_STORAGE_TOKEN,
  endpoint: new URL('https://api.web3.storage')
});

export const pinFilesToIPFS = async (
  files: {
    name: string;
    stream: () => ReadableStream;
  }[]
) => web3Storage.put(files, { wrapWithDirectory: files.length > 1 });

const pinBufferToIPFS = async (buffer: Buffer) => {
  const file = {
    name: 'metadata.json',
    stream: () => Readable.from(buffer) as unknown as ReadableStream
  };

  const cid = await web3Storage.put([file], { wrapWithDirectory: false });

  return cid;
};

const pinBufferToTheGraph = async (buffer: Buffer) => {
  const node = await ipfsTheGraph.add(buffer);
  const { hash } = node[0];
  await ipfsTheGraph.pin.add(hash);
  return hash;
};

export const pinJsonToIPFS = async (body: unknown) => {
  if (typeof body !== 'object') {
    throw new Error('body must be a valid JSON object');
  }
  const objectString = JSON.stringify(body);
  const buffer = Buffer.from(objectString);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, cid] = await Promise.all([
    pinBufferToTheGraph(buffer),
    pinBufferToIPFS(buffer)
  ]);

  return cid;
};
