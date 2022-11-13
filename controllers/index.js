import axios from "axios"
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import fs from 'fs';
import readline from 'readline';
import events from 'events';
const filename = './WLAdd.csv';
var whitelist_addresses = [];

export const getProofByAddress = async (req, res) => {
  try {
    const {address} = req.body;
    await readCSVData();
    if(whitelist_addresses.includes(address)) {
      const leaves = whitelist_addresses.map((address) => keccak256(address));
      const tree = new MerkleTree(leaves, keccak256, { sort: true });
      const root = tree.getHexRoot();
      
      const leaf = keccak256(address);
      const proof = tree.getHexProof(leaf);
      return res.status(200).json({
        status: 'success',
        data: {
          proof: proof
        }
      });
    } else {
      res.status(201).json({
        status: 'fail'
      });
    }
  } catch(err) {
    const message = error.toString();
    return res.status(400).json({ error: message });
  }
}

export const getAllProofs = async (req, res) => {
  try {
    let proof_list = [];
    await readCSVData();
    const leaves = whitelist_addresses.map((address) => keccak256(address));
    const tree = new MerkleTree(leaves, keccak256, { sort: true });
    whitelist_addresses.map((address) => {
      const leaf = keccak256(address);
      const proof = tree.getHexProof(leaf);
      proof_list.push({[address]: proof});
    });
    return res.status(200).json({
      status: 'success',
      proofs: proof_list
    })
  } catch(err) {
    const message = error.toString();
    return res.status(400).json({ error: message });
  }
}

async function readCSVData() {
  const readStream = fs.createReadStream(filename, {
    encoding: 'utf8',
  });

  // Reading line by line
  const reader = readline.createInterface({ input: readStream });
  
  reader.on('line', (line) => {
    whitelist_addresses.push(line);
  });

  readStream.on('error', (err) => {
    console.log(err);
    console.log('error found');
  });

  await events.once(reader, 'close');
}