import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as fs from "fs";
import * as dotenv from "dotenv";
import * as sdk from '../../../../sdk';

function loadKeypairFromFile(filePath: string): Keypair {
  try {
    const secretKey = Uint8Array.from(
      JSON.parse(fs.readFileSync(filePath, "utf-8"))
    );
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error("Application error:", error);
    process.exit(1);
  }
}

dotenv.config();

async function mint() {
  var argv = require('minimist')(process.argv.slice(2));
  let address = "";
  if (argv.a) {
    address = argv.a;
  }
  else {
    console.log("You have to specify address");
    return;
  }
  let quantity = 0.0;
  if (argv.q) {
    quantity = parseFloat(argv.q);
  }
  else {
    console.log("You have to specify trade quantity");
    return;
  }
  console.log(quantity);
  if (isNaN(quantity) || quantity <= 0) {
    console.log("Wrong quantity");
    return;
  }
  let network = 0;
  if (argv.n) {
    network = parseInt(argv.n);
  }
  if (isNaN(network)) {
    console.log("Wrong Network ID");
    return;
  }
  let nickname: string;
  if (argv.m) {
    nickname = argv.m;
  }
  let limit: number;
  if (argv.l) {
    limit = argv.l;
  }
  const version = parseInt(process.env.VERSION);
  const connection = new Connection(process.env.PROVIDER, "confirmed");
  const keypair = loadKeypairFromFile(process.env.KEYPAIR);
  const programId = new PublicKey(process.env.PROGRAM_ID);
  const refWallet = new PublicKey(process.env.REF_WALLET);
  let root = new sdk.RootAccount();
  const rootAccount = sdk.findRootAccountAddress(programId, version);
  const rootAccountInfo = await connection.getAccountInfo(rootAccount);
  root.update(rootAccountInfo.data);
  let mintConfig = await sdk.mint({
    wallet: keypair.publicKey,
    rootAccount: rootAccount,
    root: root,
    amount: quantity,
    programId: programId,
    connection: connection,
    networkId: network,
    address: address,
    nickname: nickname,
    limit: limit,
    refWallet: refWallet
  });
  let signers: Keypair[] = mintConfig.signers;
  signers.push(keypair);
  signers.reverse();
  const transaction = new Transaction().add(mintConfig.instruction);
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    signers
  );
  console.log("Signature:", signature);
}

mint().catch((error) => {
  console.error("Application error:", error);
  process.exit(1);
});

