import { PublicKey, Connection } from "@solana/web3.js";

export const RootAccountTag = 2;
export const TokenAccountTag = 3;
export const ClientAccountTag = 4;
  
export const NetworkStringLength = 32;
export const NicknameStringLength = 32;
export const AddressStringLength = 24;
export const MaskStringLength = 64;
export const NetworkRecordLength = 136;

export const HYPE_SEED = Buffer.from("hypewtch");

export function readPk(buf: Buffer, offset: number) {
  return new PublicKey(buf.slice(offset, offset + 32));
}

function getStringFromBuffer(buf: Buffer, start: number, maxLength: number): string {
  let str: string = "";
  for (var offset = start; offset < start + maxLength; ++offset) {
    const c = buf.readUInt8(offset);
    if (c == 0) {
      break;
    }
    str += String.fromCharCode(c);
  }
  return str;
}

export enum NetworkRecordOffsets {
  MaxLength=0,
  Validator = 8,
  Descriptor = 40,
  Mask=72
}

export class NetworkRecord {
  maxLength: number = AddressStringLength;
  validator: PublicKey = new PublicKey(0);
  descriptor: string = "";
  mask: string = "";
  unpack(buf: Buffer, offset: number) {
    this.maxLength = buf.readInt8(offset + NetworkRecordOffsets.MaxLength);
    this.validator = readPk(buf, offset + NetworkRecordOffsets.Validator);
    this.descriptor = getStringFromBuffer(buf, offset + NetworkRecordOffsets.Descriptor, NetworkStringLength);
    this.mask = getStringFromBuffer(buf, offset + NetworkRecordOffsets.Mask, MaskStringLength);
  }
}

export enum RootAccountOffsets {
  Tag = 0,
  Version = 4,
  Admin = 8,
  FeeWallet = 40,
  BaseCrncyMint = 72,
  BaseCrncyProgramAddress = 104,
  ClientsCount = 136,
  TokensCount = 144,
  Fees = 152,
  NetworksCount = 160,
  BaseCrncyDecsFactor = 164,
  Slot = 168,
  Time = 176,
  Decimals = 180,
  Supply = 184,
  Tvl = 192,
  Counter = 200,
  AllTimeBaseCrncyVolume = 208,
  AllTimeTokensVolume = 224,
  HolderFees = 240,
  InitPrice = 248,
  Slope = 256,
  FeeRatio = 264,
  FeeRate = 272,
  CreationFee = 280,
  MaxNetworksCount = 288,
  CreationTime = 292,
  MinFees = 296,
  OperatorName = 304,
  RefDuration = 336,
  Mask = 340,
  RefDiscount = 344,
  RefRatio = 352,
  UrlPrefix = 360,
  NetworkRecords = 392,
}

/**
 * @property {number} tag Root Account Tag
 * @property {number} version Smart contract version
 * @property {PublicKey} admin Admin wallet address
 * @property {PublicKey} feeWallet Wallet address for fees withdrawing
 * @property {PublicKey} baseCrncyMint Base currency mint address
 * @property {PublicKey} baseCrncyProgramAddress Base currency program address
 * @property {number} clientsCount Total clients count
 * @property {number} tokensCount Total Hype tokens count
 * @property {number} fees Fees that available to withdraw
 * @property {number} networksCount Social betworks count
 * @property {number} baseCrncyDecsFactor Base currency decimal factor (1000000 for USDC)
 * @property {number} slot Last update slot
 * @property {Date} time Last update time
 * @property {number} decimals Base currency decimals
 * @property {number} supply Total Hype tokens supply
 * @property {number} tvl TVL in base currency
 * @property {number} allTimeBaseCrncyVolume All time traded volume in base currency
 * @property {number} allTimeTokensVolume All time traded volume in Hype tokens 
 * @property {string[]} network Social networks descriptors array
 */
export class RootAccount {
  tag: number = RootAccountTag;
  version: number = 2;
  admin: PublicKey = new PublicKey(0);
  feeWallet: PublicKey = new PublicKey(0);
  baseCrncyMint: PublicKey = new PublicKey(0);
  baseCrncyProgramAddress: PublicKey = new PublicKey(0);
  clientsCount: number = 0;
  tokensCount: number = 0;
  fees: number = 0;
  networksCount: number = 0;
  baseCrncyDecsFactor: number = 0;
  slot: number = 0;
  time: Date = new Date(0);
  decimals: number = 0;
  supply: number = 0;
  tvl: number = 0;
  counter: number = 0;
  allTimeBaseCrncyVolume: number = 0;
  allTimeTokensVolume: number = 0;
  holderFees: number = 0;
  initPrice: number = 1;
  slope: number = 0.0001;
  feeRatio = 0.7;
  feeRate = 0.01;
  creationFee = 1;
  maxNetworksCount = 0;
  creationTime = new Date(0);
  minFees = 0;
  networks: NetworkRecord[] = [];
  operatorName: string = "";
  refDuration: number = 0;
  mask: number = 38;
  refDiscount: number = 0.05;
  refRatio: number = 0.1;
  urlPrefix: string = "";
  
  update(buf: Buffer) {
    this.tag = buf.readUint32LE(RootAccountOffsets.Tag);
    this.version = buf.readUint32LE(RootAccountOffsets.Version);
    this.admin = readPk(buf, RootAccountOffsets.Admin);
    this.feeWallet = readPk(buf, RootAccountOffsets.FeeWallet);
    this.baseCrncyMint = readPk(buf, RootAccountOffsets.BaseCrncyMint);
    this.baseCrncyProgramAddress = readPk(buf, RootAccountOffsets.BaseCrncyProgramAddress);
    this.clientsCount = Number(buf.readBigInt64LE(RootAccountOffsets.ClientsCount));
    this.tokensCount = Number(buf.readBigInt64LE(RootAccountOffsets.TokensCount));
    this.baseCrncyDecsFactor = buf.readUint32LE(RootAccountOffsets.BaseCrncyDecsFactor);
    this.fees = Number(buf.readBigInt64LE(RootAccountOffsets.Fees)) / this.baseCrncyDecsFactor;
    this.networksCount = buf.readUint32LE(RootAccountOffsets.NetworksCount);
    this.slot = Number(buf.readBigInt64LE(RootAccountOffsets.Slot));
    this.time = new Date(buf.readUint32LE(RootAccountOffsets.Time) * 1000);
    this.decimals = buf.readUint32LE(RootAccountOffsets.Decimals);
    this.supply = Number(buf.readBigInt64LE(RootAccountOffsets.Supply)) / this.baseCrncyDecsFactor;
    this.tvl = Number(buf.readBigInt64LE(RootAccountOffsets.Tvl)) / this.baseCrncyDecsFactor;
    this.counter = Number(buf.readBigInt64LE(RootAccountOffsets.Counter));
    this.allTimeBaseCrncyVolume = Number(buf.readBigInt64LE(RootAccountOffsets.AllTimeBaseCrncyVolume)) / this.baseCrncyDecsFactor;
    this.allTimeTokensVolume = Number(buf.readBigInt64LE(RootAccountOffsets.AllTimeTokensVolume)) / this.baseCrncyDecsFactor;
    this.holderFees = Number(buf.readBigInt64LE(RootAccountOffsets.HolderFees)) / this.baseCrncyDecsFactor;
    this.initPrice = buf.readDoubleLE(RootAccountOffsets.InitPrice);
    this.slope = buf.readDoubleLE(RootAccountOffsets.Slope);
    this.feeRatio = buf.readDoubleLE(RootAccountOffsets.FeeRatio);
    this.feeRate = buf.readDoubleLE(RootAccountOffsets.FeeRate);
    this.creationFee = buf.readDoubleLE(RootAccountOffsets.CreationFee);
    this.maxNetworksCount = buf.readUint32LE(RootAccountOffsets.MaxNetworksCount);
    this.creationTime = new Date(buf.readUint32LE(RootAccountOffsets.CreationTime) * 1000);
    this.minFees = buf.readDoubleLE(RootAccountOffsets.MinFees);
    this.operatorName = getStringFromBuffer(buf, RootAccountOffsets.OperatorName, 32);
    this.refDuration = buf.readUint32LE(RootAccountOffsets.RefDuration);
    this.mask = buf.readUint32LE(RootAccountOffsets.Mask);
    this.refDiscount = buf.readDoubleLE(RootAccountOffsets.RefDiscount);
    this.refRatio = buf.readDoubleLE(RootAccountOffsets.RefRatio);
    this.urlPrefix = getStringFromBuffer(buf, RootAccountOffsets.UrlPrefix, 32);
    this.networks.splice(0);
    for (var i = 0; i < this.networksCount; ++i) {
      const offset = RootAccountOffsets.NetworkRecords + NetworkRecordLength * i;
      let network = new NetworkRecord();
      network.unpack(buf, offset);
      this.networks.push(network);
    }
  }
}

export enum TokenAccountOffsets {
  Tag = ClientAccountTag,
  Version = 4,
  Id = 8,
  Mint = 16,
  ProgramAddress = 48,
  Creator = 80,
  CreationTime = 112,
  Time = 116,
  Supply = 120,
  Address = 128,
  Network = 152,
  Slot = 160,
  AllTimeTradesCount = 168,
  AllTimeBaseCrncyVolume = 176,
  AllTimeTokensVolume = 192,
  Validation=208
}

/**
 * @property {number} tag Token Account Tag
 * @property {number} version Smart contract version
 * @property {number} id Hype token ID
 * @property {PublicKey} mint Hype token mint address
 * @property {PublicKey} programAddress Hype token program address
 * @property {PublicKey} creator Hype token creator's wallet address
 * @property {Date} creationTime Creation time 
 * @property {Date} time Last update time 
 * @property {number} supply Hype token supply
 * @property {string} address Address in social network
 * @property {number} network Social network ID
 * @property {number} slot Last update slot
 * @property {number} allTimeBaseCrncyVolume All time traded volume in base currency
 * @property {number} allTimeTokensVolume All time traded volume in Hype tokens
 * @property {number} allTimeTradesCount Total trades count
 */
export class TokenAccount {
  tag: number = TokenAccountTag;
  version: number = 2;
  id: number = 0;
  mint: PublicKey = new PublicKey(0);
  programAddress: PublicKey = new PublicKey(0);
  creator: PublicKey = new PublicKey(0);
  creationTime: Date = new Date(0);
  time: Date = new Date(0);
  supply: number = 0;
  address: string = "";
  network: number = 0;
  slot: number = 0;
  allTimeTradesCount: number = 0;
  allTimeBaseCrncyVolume: number = 0;
  allTimeTokensVolume: number = 0;
  validation = 0;

  update(buf: Buffer, baseCrncyDecsFactor: number) {
    this.tag = buf.readUint32LE(TokenAccountOffsets.Tag);
    this.version = buf.readUint32LE(TokenAccountOffsets.Version);
    this.id = Number(buf.readBigInt64LE(TokenAccountOffsets.Id));
    this.mint = readPk(buf, TokenAccountOffsets.Mint);
    this.programAddress = readPk(buf, TokenAccountOffsets.ProgramAddress);
    this.creator = readPk(buf, TokenAccountOffsets.Creator);
    this.creationTime = new Date(buf.readUint32LE(TokenAccountOffsets.CreationTime) * 1000);
    this.time = new Date(buf.readUint32LE(TokenAccountOffsets.Time) * 1000);
    this.supply = Number(buf.readBigInt64LE(TokenAccountOffsets.Supply)) / baseCrncyDecsFactor;
    this.address = getStringFromBuffer(buf, TokenAccountOffsets.Address, NetworkStringLength);
    this.slot = Number(buf.readBigInt64LE(TokenAccountOffsets.Slot));
    this.network = buf.readUint32LE(TokenAccountOffsets.Network);
    this.allTimeBaseCrncyVolume = Number(buf.readBigInt64LE(TokenAccountOffsets.AllTimeBaseCrncyVolume)) / baseCrncyDecsFactor;
    this.allTimeTokensVolume = Number(buf.readBigInt64LE(TokenAccountOffsets.AllTimeTokensVolume)) / baseCrncyDecsFactor;
    this.allTimeTradesCount = Number(buf.readBigInt64LE(TokenAccountOffsets.AllTimeTradesCount));
    this.validation = buf.readUint32LE(TokenAccountOffsets.Validation);
  }
}

export enum ClientAccountOffsets {
  Tag = ClientAccountTag,
  Version = 4,
  Id = 8,
  Wallet = 16,
  AllTimeBaseCrncyVolume = 48,
  AllTimeTokensVolume = 56,
  Slot = 64,
  Time = 72,
  TokensCreated = 76,
  RefStop = 80,
  AllTimeTradesCount = 84,
  Nickname = 88,
  RefAddress = 120,
  RefPaid = 152,
  RefDiscount = 160,
  RefRatio = 168
}

/**
 * @property {number} tag Client Account Tag
 * @property {number} version Smart contract version
 * @property {number} id Client ID
 * @property {PublicKey} wallet Client wallet
 * @property {number} allTimeBaseCrncyVolume All time traded volume in base currency
 * @property {number} allTimeTokensVolume All time traded volume in Hype tokens
 * @property {number} slot Last update slot
 * @property {Date} time Last update time 
 * @property {number} tokensCreated Total tokens created by client
 * @property {number} allTimeTradesCount Total client's trades count
 * @property {PublicKey} nft Client NFT reference
 * @property {string} nickname Client's nickname
 */

export class ClientAccount {
  tag: number = ClientAccountTag;
  version: number = 2;
  id: number = 0;
  wallet: PublicKey = new PublicKey(0);
  allTimeBaseCrncyVolume: number = 0;
  allTimeTokensVolume: number = 0;
  slot: number = 0;
  time: Date = new Date(0);
  tokensCreated: number = 0;
  allTimeTradesCount: number = 0;
  nickname: string = "";
  refStop: Date = new Date(0);
  refAddress: PublicKey = new PublicKey(0);
  refPaid: number = 0;
  refDiscount: number = 0;
  refRatio: number = 0;
  
  update(buf: Buffer, baseCrncyDecsFactor: number) {
    this.tag = buf.readUint32LE(ClientAccountOffsets.Tag);
    this.version = buf.readUint32LE(ClientAccountOffsets.Version);
    this.id = Number(buf.readBigInt64LE(ClientAccountOffsets.Id));
    this.wallet = readPk(buf, ClientAccountOffsets.Wallet);
    this.nickname = getStringFromBuffer(buf, ClientAccountOffsets.Nickname, NicknameStringLength);
    this.allTimeBaseCrncyVolume = Number(buf.readBigInt64LE(ClientAccountOffsets.AllTimeBaseCrncyVolume)) / baseCrncyDecsFactor;
    this.allTimeTokensVolume = Number(buf.readBigInt64LE(ClientAccountOffsets.AllTimeTokensVolume)) / baseCrncyDecsFactor;
    this.allTimeTradesCount = Number(buf.readBigInt64LE(ClientAccountOffsets.AllTimeTradesCount));
    this.tokensCreated = buf.readUint32LE(ClientAccountOffsets.TokensCreated);
    this.slot = Number(buf.readBigInt64LE(ClientAccountOffsets.Slot));
    this.time = new Date(buf.readUint32LE(ClientAccountOffsets.Time) * 1000);
    this.refAddress = readPk(buf, ClientAccountOffsets.RefAddress);
    this.refPaid = Number(buf.readBigInt64LE(ClientAccountOffsets.RefPaid)) / baseCrncyDecsFactor;
    this.refDiscount = buf.readDoubleLE(ClientAccountOffsets.RefDiscount);
    this.refRatio = buf.readDoubleLE(ClientAccountOffsets.RefRatio);
  }
}

/**
 * @property {number} Error Error event
 * @property {number} NewClient New client event
 * @property {number} NewNetwork New network event
 * @property {number} NewToken New token event
 * @property {number} Mint Mint event
 * @property {number} Burn Burn event
 */
export enum Event {
  Error = 0,
  NewClient = 1,
  NewNetwork = 2,
  NewToken = 3,
  Mint = 4,
  Burn = 5,
}

/**
 * @property {number} orderId Event order ID
 * @property {number} clientId New client ID
 * @property {PublicKey} wallet Client wallet
 * @property {Date} time Event time
 * @property {number} slot Event slot
 */
export interface NewClientReport {
  orderId: number;
  clientId: number;
  wallet: PublicKey;
  time: Date;
  slot: number;
}

/**
 * @property {number} networkId New network ID
 * @property {string} descriptor Betwork descriptor string
 * @property {Date} time Event time
 * @property {number} slot Event slot
 */
export interface NewNetworkReport {
  networkId: number;
  descriptor: string;
  time: Date;
  slot: number;
}

/**
 * @property {number} orderId Event order ID
 * @property {number} clientId Creator's client ID
 * @property {number} tokenId New token ID
 * @property {number} networkId Network ID
 * @property {PublicKey} mint Token mint
 * @property {PublicKey} creator Token creator public key
 * @property {string} address Token address
 * @property {Date} time Event time
 * @property {number} slot Event slot
 */
export interface NewTokenReport {
  orderId: number;
  clientId: number;
  networkId: number;
  mint: PublicKey;
  creator: PublicKey;
  address: string;
  tokenId: number;
  time: Date;
  slot: number;
}

/**
 * @property {number} orderId Event order ID
 * @property {number} clientId Client ID
 * @property {number} tokenId Token ID
 * @property {number} networkId Token ID
 * @property {PublicKey} mint Token mint
 * @property {PublicKey} creator Token creator public key
 * @property {string} address Token address
 * @property {number} supply Token supply
 * @property {Date} creationTime Creation time
 * @property {number} allTimeTradesCount Token all time trades count
 * @property {number} allTimeBaseCrncyVolume Token all time base currency volume
 * @property {number} allTimeTokensVolume Token all time tokensvolume
 * @property {number} baseCrncyAmount Trade's base currency amount 
 * @property {number} tokenId Traded tokens amount
 * @property {Date} time Event time
 * @property {number} slot Event slot
 */
export interface MintReport {
  clientId: number;
  orderId: number;
  tokenId: number;
  networkId: number;
  mint: PublicKey;
  creator: PublicKey;
  address: string;
  supply: number;
  creationTime: Date;
  allTimeTradesCount: number;
  allTimeBaseCrncyVolume: number;
  allTimeTokensVolume: number;
  tokensAmount: number;
  baseCrncyAmount: number;
  time: Date;
  slot: number;
}

/**
 * @property {number} orderId Event order ID
 * @property {number} clientId Client ID
 * @property {number} tokenId Token ID
 * @property {number} networkId Token ID
 * @property {PublicKey} mint Token mint
 * @property {PublicKey} creator Token creator public key
 * @property {string} address Token address
 * @property {number} supply Token supply
 * @property {Date} creationTime Creation time
 * @property {number} allTimeTradesCount Token all time trades count
 * @property {number} allTimeBaseCrncyVolume Token all time base currency volume
 * @property {number} allTimeTokensVolume Token all time tokensvolume
 * @property {number} baseCrncyAmount Trade's base currency amount 
 * @property {number} tokenId Traded tokens amount
 * @property {Date} time Event time
 * @property {number} slot Event slot
 */
export interface BurnReport {
  clientId: number;
  orderId: number;
  tokenId: number;
  networkId: number;
  mint: PublicKey;
  creator: PublicKey;
  address: string;
  supply: number;
  creationTime: Date;
  allTimeTradesCount: number;
  allTimeBaseCrncyVolume: number;
  allTimeTokensVolume: number;
  tokensAmount: number;
  baseCrncyAmount: number;
  time: Date;
  slot: number;
}

export interface Report {
  event: Event;
  report: NewClientReport | NewNetworkReport | NewTokenReport | MintReport | BurnReport | string;
}

/**
 * @property {Connection} connection @solana/web3.js Connection
 * @property {RootAccount} root RootAccount instance
 * @property {PublicKey} rootAccount Root account address
 * @property {PublicKey} wallet Client's wallet address
 * @property {string} nickname Client's nickname (for there is no client's account)
 * @property {PublicKey} programId Smart contract address
 * @property {number} networkId Social network ID
 * @property {string} address Address in social network
 * @property {number} amount Tokens amount to trade
 * @property {number} limit The worst traded sum limit (for slippage)
 */
export interface TradeArgs {
  connection: Connection;
  root: RootAccount;
  rootAccount: PublicKey;
  wallet: PublicKey;
  nickname?: string;
  programId: PublicKey;
  networkId: number;
  address: string;
  amount: number;
  limit?: number;
  refWallet?: PublicKey;
}

/**
 * @property {Connection} connection @solana/web3.js Connection
 * @property {RootAccount} root RootAccount instance
 * @property {PublicKey} wallet Client's wallet address
 * @property {string} nickname New client's nickname 
 * @property {PublicKey} programId Smart contract address
 */
export interface ChangeClientDataArgs {
  connection: Connection;
  root: RootAccount;
  wallet: PublicKey;
  nickname: string;
  programId: PublicKey;
}

