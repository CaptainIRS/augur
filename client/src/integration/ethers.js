import ethers from 'ethers';
import AugurToken from '../../src/contracts/AugurToken.json';

function getProvider() {
  return new ethers.providers.JsonRpcProvider('http://localhost:8545');
}


export function getContract() {
    const contractAddress = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984';
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    const contract = new ethers.Contract(contractAddress, AugurToken.abi, provider);

    return contract;
}

