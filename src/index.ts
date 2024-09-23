import { Keypair, PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import {
    Report, Event, RootAccountTag, ClientAccountTag, HYPE_SEED, TradeArgs, readPk,
    NicknameStringLength,
    NetworkStringLength,
} from './types';
import {
    ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID
} from '@solana/spl-token';
export * from './types';

function getU64(base64: string): number {
    return Number(Buffer.from(base64, 'base64').readBigInt64LE())
}

function getU32(base64: string): number {
    return Number(Buffer.from(base64, 'base64').readUint32LE())
}

function getTime(base64: string): Date {
    return new Date(getU32(base64) * 1000)
}

function getString(base64: string): string {
    let str = "";
    const buf = Buffer.from(base64, 'base64');
    for (var i = 0; i < buf.byteLength; ++i) {
        const c = buf.readUInt8(i);
        if (c == 0) {
            break;
        }
        str += String.fromCharCode(c);
    }
    return str;
}

export function findHypeAuthorityAddress(programId: PublicKey): PublicKey {
    const [hypeAuthority] = PublicKey.findProgramAddressSync([HYPE_SEED], programId);
    return hypeAuthority;
}

export function findRootAccountAddress(programId: PublicKey, version: number): PublicKey {
  let buf = Buffer.alloc(8);
  buf.writeInt32LE(version, 0);
  buf.writeInt32LE(RootAccountTag, 4);
  const [hypeAuthority] = PublicKey.findProgramAddressSync([HYPE_SEED], programId);
  const [rootAccount] = PublicKey.findProgramAddressSync([buf, hypeAuthority.toBytes()], programId);
  return rootAccount;
}

export function findTokenAccountAddress(programId: PublicKey, networkId: number, address: string, version: number): PublicKey {
  let buf = Buffer.alloc(32);
  buf.write(address, 0, address.length, 'utf-8');
  buf.writeInt32LE(networkId, 24);
  buf.writeInt32LE(version, 28);
  const [hypeAuthority] = PublicKey.findProgramAddressSync([HYPE_SEED], programId);
  const [tokenAccount] = PublicKey.findProgramAddressSync([buf, hypeAuthority.toBytes()], programId);
  return tokenAccount;
}

export function findClientAccountAddress(programId: PublicKey, wallet: PublicKey, version: number): PublicKey {
  let buf = Buffer.alloc(8);
  buf.writeInt32LE(version, 0);
  buf.writeInt32LE(ClientAccountTag, 4);
  const [clientAccount] = PublicKey.findProgramAddressSync([buf, wallet.toBytes()], programId);
  return clientAccount;
}

export async function mint(args: TradeArgs): Promise<{
    instruction: TransactionInstruction;
    signers: Keypair[];
}> {
    const hypeAuthority = findHypeAuthorityAddress(args.programId);
    const clientAccount = findClientAccountAddress(args.programId, args.wallet, args.root.version);
    const aTokenAcc = getAssociatedTokenAddressSync(args.root.baseCrncyMint, args.wallet);
    const tokenAccount = findTokenAccountAddress(args.programId, args.networkId, args.address, args.root.version);
    let tokenMint: PublicKey;
    let tokenMintKeypair: Keypair;
    let tokenProgram: PublicKey;
    let tokenProgramKeypair: Keypair;
    let signers = [];
    try {
        const tokenAccountInfo = await args.connection.getAccountInfo(tokenAccount);
        tokenMint = readPk(tokenAccountInfo.data, 16);
        tokenProgram = readPk(tokenAccountInfo.data, 48);
        tokenMintKeypair = null;
        tokenProgramKeypair = null;
    }
    catch (_) {
        tokenMint = null;
        tokenProgram = null;
        tokenMintKeypair = Keypair.generate();
        tokenProgramKeypair = Keypair.generate();
        signers.push(tokenMintKeypair);
        signers.push(tokenProgramKeypair);
    }
    const aHypeAcc = getAssociatedTokenAddressSync(
        tokenMint == null ? tokenMintKeypair.publicKey : tokenMint,
        args.wallet,
        false,
        TOKEN_2022_PROGRAM_ID
    );
    var buf = Buffer.alloc(80);
    buf.writeUint8(2, 0);
    buf.writeUint32LE(args.networkId, 4);
    buf.writeBigInt64LE(BigInt(args.amount * 1000000), 32);
    if (args.nickname != undefined) {
        buf.write(args.nickname, 48, Math.min(NicknameStringLength, args.nickname.length), 'utf-8');
    }
    if (args.limit != undefined && args.limit > 0) {
        buf.writeBigInt64LE(BigInt(args.limit * 1000000), 40);
    }
    buf.write(args.address, 8, Math.min(NetworkStringLength, args.address.length), 'utf-8');
    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: args.wallet, isSigner: true, isWritable: true },
            { pubkey: clientAccount, isSigner: false, isWritable: true },
            { pubkey: aTokenAcc, isSigner: false, isWritable: true },
            { pubkey: aHypeAcc, isSigner: false, isWritable: true },
            { pubkey: args.rootAccount, isSigner: false, isWritable: true },
            { pubkey: tokenAccount, isSigner: false, isWritable: true },
            { pubkey: args.root.baseCrncyMint, isSigner: false, isWritable: false },
            { pubkey: args.root.baseCrncyProgramAddress, isSigner: false, isWritable: true },
            { pubkey: tokenMint == null ? tokenMintKeypair.publicKey : tokenMint, isSigner: tokenMint == null, isWritable: true },
            { pubkey: tokenProgram == null ? tokenProgramKeypair.publicKey : tokenProgram, isSigner: tokenProgram == null, isWritable: true },
            { pubkey: hypeAuthority, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: args.programId,
        data: buf,
    });
    return {
        instruction: instruction,
        signers: signers
    }
}

export async function burn(args: TradeArgs): Promise<TransactionInstruction> {
    const hypeAuthority = findHypeAuthorityAddress(args.programId);
    const clientAccount = findClientAccountAddress(args.programId, args.wallet, args.root.version);
    const aTokenAcc = getAssociatedTokenAddressSync(args.root.baseCrncyMint, args.wallet);
    const tokenAccount = findTokenAccountAddress(args.programId, args.networkId, args.address, args.root.version);
    const tokenAccountInfo = await args.connection.getAccountInfo(tokenAccount);
    let tokenMint = readPk(tokenAccountInfo.data, 16);
    let tokenProgram = readPk(tokenAccountInfo.data, 48);
    const aHypeAcc = getAssociatedTokenAddressSync(
        tokenMint,
        args.wallet,
        false,
        TOKEN_2022_PROGRAM_ID
    );
    var buf: Buffer;
    buf= Buffer.alloc(56);
    buf.writeUint8(3, 0);
    buf.writeBigInt64LE(BigInt(args.amount * 1000000), 8);
    if (args.nickname != undefined) {
        buf.write(args.nickname, 24, Math.min(NicknameStringLength, args.nickname.length), 'utf-8');
    }
    if (args.limit != undefined && args.limit > 0) {
        buf.writeBigInt64LE(BigInt(args.limit * 1000000), 16);
    }
    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: args.wallet, isSigner: true, isWritable: true },
            { pubkey: clientAccount, isSigner: false, isWritable: true },
            { pubkey: aTokenAcc, isSigner: false, isWritable: true },
            { pubkey: aHypeAcc, isSigner: false, isWritable: true },
            { pubkey: args.rootAccount, isSigner: false, isWritable: true },
            { pubkey: tokenAccount, isSigner: false, isWritable: true },
            { pubkey: args.root.baseCrncyMint, isSigner: false, isWritable: false },
            { pubkey: args.root.baseCrncyProgramAddress, isSigner: false, isWritable: true },
            { pubkey: tokenMint, isSigner: false, isWritable: true },
            { pubkey: tokenProgram, isSigner: false, isWritable: true },
            { pubkey: hypeAuthority, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: args.programId,
        data: buf,
    });
    return instruction;
}

export function getReports(logs: string[], decsFactor: number): Report[] {
    let reports: Report[] = [];
    for (var log of logs) {
        if (log.startsWith("Program data:")) {
            let fields = log.substring(14).split(' ');
            switch (Buffer.from(fields[0], 'base64').readUint8()) {
                case Event.NewClient: {
                    reports.push({
                        event: Event.NewClient,
                        report: {
                            clientId: getU64(fields[1]),
                            orderId: getU64(fields[2]),
                            wallet: new PublicKey(Buffer.from(fields[3], 'base64')),
                            time: getTime(fields[4]),
                            slot: getU64(fields[5]),
                        }
                    });
                    break;
                }
                case Event.NewNetwork: {
                    reports.push({
                        event: Event.NewNetwork,
                        report: {
                            networkId: getU32(fields[1]),
                            descriptor: getString(fields[2]),
                            time: getTime(fields[3]),
                            slot: getU64(fields[4]),
                        }
                    });
                    break;
                }
                case Event.NewToken: {
                    reports.push({
                        event: Event.NewToken,
                        report: {
                            clientId: getU64(fields[1]),
                            orderId: getU64(fields[2]),
                            networkId: getU32(fields[3]),
                            tokenId: getU32(fields[4]),
                            address: getString(fields[5]),
                            time: getTime(fields[6]),
                            slot: getU64(fields[7]),
                        }
                    });
                    break;
                }
                case Event.Mint: {
                    reports.push({
                        event: Event.Mint,
                        report: {
                            clientId: getU64(fields[1]),
                            orderId: getU64(fields[2]),
                            tokenId: getU32(fields[3]),
                            tokensAmount: getU64(fields[4]),
                            baseCrncyAmount: getU64(fields[5]),
                            time: getTime(fields[6]),
                            slot: getU64(fields[7]),
                        }
                    });
                    break;
                }
                case Event.Burn: {
                    reports.push({
                        event: Event.Burn,
                        report: {
                            clientId: getU64(fields[1]),
                            orderId: getU64(fields[2]),
                            tokenId: getU32(fields[3]),
                            tokensAmount: getU64(fields[4]),
                            baseCrncyAmount: getU64(fields[5]),
                            time: getTime(fields[6]),
                            slot: getU64(fields[7]),
                        }
                    });
                    break;
                }
            }
        }
        else if (log.startsWith("Error:")) {
            reports.push({
                event: Event.Error,
                report: log.substring(7)
            });
        }
    }
    return reports;
}
