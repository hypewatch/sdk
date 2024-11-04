# Hype.watch SDK

TypeScript SDK for interacting with Hype.watch's Solana smart contract. This SDK provides functionality for minting and burning Hype tokens, as well as managing client data on the Solana blockchain.

## Features

- Mint Hype tokens
- Burn Hype tokens
- Manage client data
- View root account information
- Track token transactions and events

## Prerequisites

- Node.js
- Solana web3.js
- A Solana wallet and Solana RPC endpoint

## Supported Network IDs

The following table outlines the supported `networkId`s and their corresponding social networks:

| Network ID | Social Network |
|------------|----------------|
| 0          | Twitter        |
| 1          | Telegram       |
| 2          | Facebook       |
| 3          | Instagram      |

## Usage

### Initialize Connection

```typescript
import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import * as sdk from '../../sdk';

const connection = new Connection("YOUR_SOLANA_ENDPOINT", "confirmed"); // e.g., https://api.devnet.solana.com/
const programId = new PublicKey("HYPE_PROGRAM_ID"); // e.g., Devnet: 5k9VtrtQZWu56qz41cZJmQJTr1CGuSQZE2EEJT77PZUg
```

### Mint Tokens

```typescript
// Get mint instruction
const mintConfig = await sdk.mint({
    wallet: walletPublicKey, // Solana wallet address
    rootAccount: rootAccountAddress, // Root account address
    root: rootAccountInstance, // Instance of the root account
    amount: tokenAmount, // Amount to mint (e.g., 1 token = 1)
    programId: programId, // Program ID (e.g., 5k9VtrtQZWu56qz41cZJmQJTr1CGuSQZE2EEJT77PZUg)
    connection: connection, // Connection to the Solana cluster
    networkId: networkId, // Network ID (0 = Twitter, 1 = Telegram, 2 = Facebook, 3 = Instagram)
    address: socialNetworkAddress, // Token mint address (e.g., durov, elonmusk)
    nickname: optionalNickname, // Optional nickname
    limit: optionalLimit // Optional limit for slippage
});

// Send transaction using Solana web3.js
const transaction = new Transaction().add(mintConfig.instruction);
const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [keypair, ...mintConfig.signers]
);
```

### Burn Tokens

```typescript
const burnInstruction = await sdk.burn({
    wallet: walletPublicKey, // Solana wallet address
    rootAccount: rootAccountAddress, // Root account address
    root: rootAccountInstance, // Instance of the root account
    amount: tokenAmount, // Amount to burn (e.g., 1 token = 1)
    programId: programId, // Program ID (e.g., 5k9VtrtQZWu56qz41cZJmQJTr1CGuSQZE2EEJT77PZUg)
    connection: connection, // Connection to the Solana cluster
    networkId: networkId, // Network ID (0 = Twitter, 1 = Telegram, 2 = Facebook, 3 = Instagram)
    address: socialNetworkAddress, // Token mint address
    nickname: optionalNickname, // Optional nickname
    limit: optionalLimit // Optional limit for slippage
});

// Send transaction using Solana web3.js
const transaction = new Transaction().add(burnConfig.instruction);
const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [keypair, ...burnConfig.signers]
);
```

### Monitor Smart Contract Logs

```typescript
// Get root account address
const rootAccount = sdk.findRootAccountAddress(programId, version);

// Subscribe to logs
connection.onLogs(
    rootAccount,
    (logs) => {
        // Parse logs using SDK
        const reports = sdk.getReports(logs);
        console.log('Parsed logs:', reports);
    },
    'confirmed'
);
```

### View Root Account Information

```typescript
const rootAccount = sdk.findRootAccountAddress(programId, version); // Find the root account address
const rootAccountInfo = await connection.getAccountInfo(rootAccount); // Get account info
const root = new sdk.RootAccount(); // Create a new instance of RootAccount
root.update(rootAccountInfo.data); // Update the root account with the retrieved data
```

## Current Parameters

- Program ID: `5k9VtrtQZWu56qz41cZJmQJTr1CGuSQZE2EEJT77PZUg`
- Version: `2`

## Examples

The SDK includes several example implementations:

1. Token Minting
```typescript
examples/mint-ts/src/index.ts
```

2. Token Burning
```typescript
examples/burn-ts/src/index.ts
```

3. Root Account Visualization
```typescript
examples/print-root-ts/src/index.ts
```