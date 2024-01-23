import IPFSClient from 'ipfs-http-client';
import { Readable } from 'stream';

// the graph's hosted network ipfs node works best with ipfs-http-client 34.0.0
const ipfsTheGraph = new IPFSClient({
  protocol: 'https',
  host: 'api.thegraph.com',
  port: 443,
  'api-path': '/ipfs/api/v0/'
});

type FileLike = {
  name: string;
  stream: () => ReadableStream;
};

const w3upClient = import('./w3up.mts').then(m => m.w3upClient);

export const pinFilesToIPFS = async (files: FileLike[]) => {
  const client = await w3upClient;

  if (files.length === 1) {
    return client.uploadFile(files[0]);
  }
  return client.uploadDirectory(files);
};

const pinBufferToIPFS = async (buffer: Buffer) => {
  const file = {
    name: 'metadata.json',
    stream: () => Readable.toWeb(Readable.from(buffer)) as ReadableStream
  };

  const client = await w3upClient;

  return client.uploadFile(file);
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
  const [cid] = await Promise.all([
    pinBufferToTheGraph(buffer),
    pinBufferToIPFS(buffer)
  ]);

  return cid;
};
