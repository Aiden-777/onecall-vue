export interface BlockHeaderInfo {
  id: string;
  height: number;
  count: number;
}
export enum TransferType {
  TRX,
  TRC20,
  TRC10,
}
export enum TransactionStatus {
  UNKNOWN,
  SUCCESS,
  FAILED,
}
export interface TransferInfo {
  id: string;
  transferType: TransferType;
  from: string;
  to: string;
  amount: string; //为兼容JS精度使用string类型,Java使用Bigdecimal
  status: TransactionStatus;
  contractAddress: string | undefined;
  assetName: string | undefined;
  broadcastTime: string;
}

export interface Block {
  header: BlockHeaderInfo;
  transfers: Array<TransferInfo>;
}

export interface CallbackNotify {
  address: string;
  transferType: TransferType;
  contractTarget: string;
  minAmount: string;
  callbackUrl: string;
}
