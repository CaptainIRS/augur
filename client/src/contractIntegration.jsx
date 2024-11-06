import { ethers } from 'ethers';

const contractAddress = ''; // 
const contractABI = []; // Can you change this?

let provider;
let signer;
let contract;

export async function initializeContract() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      contract = new ethers.Contract(contractAddress, contractABI, signer);
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      throw error;
    }
  } else {
    throw new Error('Ethereum provider not found. Please install MetaMask.');
  }
}

export async function createContest(metadata, totalReward, rewardThreshold, startTime, roundDuration, totalRounds) {
  if (!contract) await initializeContract();
  try {
    const tx = await contract.createContest(
      metadata,
      ethers.utils.parseEther(totalReward.toString()),
      rewardThreshold,
      Math.floor(new Date(startTime).getTime() / 1000),
      roundDuration * 24 * 60 * 60, // Convert days to seconds
      totalRounds
    );
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error creating contest:', error);
    throw error;
  }
}

export async function participate(contestId) {
  if (!contract) await initializeContract();
  try {
    const tx = await contract.participate(contestId);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error participating in contest:', error);
    throw error;
  }
}

export async function submit(contestId, submission, commitment) {
  if (!contract) await initializeContract();
  try {
    const tx = await contract.submit(contestId, submission, commitment);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error submitting entry:', error);
    throw error;
  }
}

export async function getContestDetails(contestId) {
  if (!contract) await initializeContract();
  try {
    const contest = await contract.contests(contestId);
    return {
      organizer: contest.organizer,
      metadata: contest.metadata.toNumber(),
      totalReward: ethers.utils.formatEther(contest.totalReward),
      rewardThreshold: contest.rewardThreshold,
      startTime: contest.startTime.toNumber(),
      roundDuration: contest.roundDuration.toNumber() / (24 * 60 * 60), // Convert seconds to days
      totalRounds: contest.totalRounds,
      currentRound: contest.currentRound
    };
  } catch (error) {
    console.error('Error getting contest details:', error);
    throw error;
  }
}

export async function getContestsCount() {
  if (!contract) await initializeContract();
  try {
    const count = await contract.contestsCount();
    return count.toNumber();
  } catch (error) {
    console.error('Error getting contests count:', error);
    throw error;
  }
}