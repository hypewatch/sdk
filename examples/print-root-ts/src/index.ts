import {
  Connection,
  PublicKey,
} from "@solana/web3.js";
import * as dotenv from "dotenv";
import * as sdk from '../../sdk';

dotenv.config();

async function printRoot() {
  const version = parseInt(process.env.VERSION);
  const connection = new Connection(process.env.PROVIDER, "confirmed");
  const programId = new PublicKey(process.env.PROGRAM_ID);
  let root = new sdk.RootAccount();
  const rootAccount = sdk.findRootAccountAddress(programId, version);
  console.log("Root Account", rootAccount.toBase58());
  const rootAccountInfo = await connection.getAccountInfo(rootAccount);
  root.update(rootAccountInfo.data);
  console.log("Program ID", programId.toBase58());
  console.log("Root Account", rootAccount.toBase58());
  console.log("Admin:", root.admin.toBase58());
  console.log("Fee Wallet:", root.feeWallet.toBase58());
  console.log("USDC Mint:", root.baseCrncyMint.toBase58());
  console.log("USDC Program Address:", root.baseCrncyProgramAddress.toBase58());
  console.log("Clients Count:", root.clientsCount);
  console.log("Tokens Count:", root.tokensCount);
  console.log("Fees:", root.fees);
  console.log("Supply:", root.supply);
  console.log("TVL:", root.tvl);
  console.log("Counter:", root.counter);
  console.log("All time USDC Volume:", root.allTimeBaseCrncyVolume);
  console.log("All time tokens volume:", root.allTimeTokensVolume);
  console.log("Networks count:", root.networksCount);
  console.log("USDC Decimals Factor:", root.decimals);
  console.log("Hype Token Decimals:", root.baseCrncyDecsFactor);
  console.log("Last Slot:", root.slot);
  console.log("Last Time:", root.time);
  console.log("Holder fees:", root.holderFees);
  console.log("Init price:", root.initPrice);
  console.log("Slope:", root.slope);
  console.log("Fee ratio:", root.feeRatio);
  console.log("Fee rate:", root.feeRate);
  console.log("Creation fee:", root.creationFee);
  console.log("Max networks count:", root.maxNetworksCount);
  console.log("Creation time:", root.creationTime);
  console.log("Min fees:", root.minFees);
  for (var i = 0; i < root.networksCount; ++i) {
    console.log("  Network ID:", i);
    console.log("  Descriptor:", root.networks[i].descriptor);
    console.log("  Mask:", root.networks[i].mask);
    console.log("  Max length:", root.networks[i].maxLength);
  }
}

printRoot().catch((error) => {
  console.error("Application failed:", error);
  process.exit(1);
});

