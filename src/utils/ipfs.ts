import IPFSClient from 'ipfs-http-client';
import { Web3Storage } from 'web3.storage';
import { WEB3_STORAGE_TOKEN } from '@/utils/constants';
import { createReadStream } from 'fs';
import { mkdtemp, rmdir, unlink, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';

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
  const name = path.join(
    await mkdtemp(path.join(os.tmpdir(), 'metadatas-')),
    'metadata.json'
  );
  await writeFile(name, buffer);

  const readable = createReadStream(name) as unknown as ReadableStream<string>;

  const tmpFile = {
    name: 'metadata.json',
    stream: () => readable
  };

  const cid = await web3Storage.put([tmpFile], { wrapWithDirectory: false });

  await unlink(name);
  await rmdir(path.dirname(name));

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
  const [_, cid] = await Promise.all([
    pinBufferToTheGraph(buffer),
    pinBufferToIPFS(buffer)
  ]);

  await ipfsTheGraph.pin.add(cid);
  return cid;
};
