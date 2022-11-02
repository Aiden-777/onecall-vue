<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from "vue";

import { Client } from "@stomp/stompjs";
import {
  TransferType,
  type BlockHeaderInfo,
  type CallbackNotify,
} from "@/type/TronType";

import { register } from "@/api/tronApi";
import { ElNotification } from "element-plus";

console.log("当前运行环境：" + import.meta.env.MODE);

// 后端API地址
const api = import.meta.env.VITE_API;
// ws连接地址
const stompAPi = import.meta.env.VITE_STOMP_API;

// 最新块
const latestBlockHeight = ref(0);

// 区块头列表
const blockHeaderList: Ref<Array<BlockHeaderInfo>> = ref([]);

// 转账列表
const transfers: Ref<Array<any>> = ref([]);

// 创建stomp连接客户端
const client = new Client({
  brokerURL: stompAPi,
});

// 实时区块信息
const callback_block_header = function (message: any) {
  // called when the client receives a STOMP message from the server
  if (message.body) {
    // console.log("got message with body " + message.body);
    if (blockHeaderList.value.length == 5) {
      blockHeaderList.value.pop();
    }
    blockHeaderList.value.unshift(JSON.parse(message.body));
    latestBlockHeight.value = blockHeaderList.value[0].height;
  } else {
    console.log("got empty message");
  }
};
// 实时到账信息
const callback_transfer_notify = function (message: any) {
  // called when the client receives a STOMP message from the server
  if (message.body) {
    // console.log("got message with body " + message.body);
    if (transfers.value.length == 10) {
      transfers.value.pop();
    }
    transfers.value.unshift(JSON.parse(message.body));
  } else {
    console.log("got empty message");
  }
};
// stomp 连接成功回调
client.onConnect = function (frame) {
  ElNotification({
    message: "websocket连接成功",
    type: "success",
  });

  console.log("onConnect", frame);

  const blockHeader = client.subscribe("/block-header", callback_block_header);
  console.log(blockHeader);

  const transferNotify = client.subscribe(
    "/transfer-notify",
    callback_transfer_notify
  );
  console.log(transferNotify);
};

// stomp 错误回调
client.onStompError = function (frame) {
  console.log("Broker reported error: " + frame.headers["message"]);
  console.log("Additional details: " + frame.body);
};
// websocket 连接失败
client.onWebSocketError = function () {
  ElNotification({
    title: "Error",
    message: "websocket连接失败，无法实时展示区块信息",
    type: "error",
  });
};
// vue3 页面加载后回调
onMounted(() => {
  client.activate();
});

// 监听地址请求参数
const args: Ref<CallbackNotify> = ref({
  address: "",
  transferType: TransferType.TRX,
  contractTarget: "",
  minAmount: "0",
  callbackUrl: "",
});
// 表单提交错误信息
const args_err = ref("");
// 监听表单变化，如有变化清空错误提示信息
watch(
  () => args,
  () => {
    args_err.value = "";
  },
  {
    deep: true,
  }
);
// 提交地址监听方法
const ok = () => {
  register(args.value)
    .then(() => {
      ElNotification({
        title: "Ok",
        message: "添加地址监听",
        type: "success",
      });
    })
    .catch((err) => {
      args_err.value = err.data.message;
    });
};
</script>

<template>
  <main>
    <div class="container">
      <h1>WS-STOMP协议连接，实时获取最新区块信息。</h1>
      <p style="color: green">任意语言都可以使用，本页面以ts实现</p>
      <p>连接地址：{{ stompAPi }}</p>
      <p>
        订阅<b>/block</b>可获取完整的JSON格式区块信息，仅包含
        <b>trc20、trx</b> 转账交易列表
      </p>
      <p>订阅<b>/block-header</b>可获取JSON格式区块<b>头</b>信息</p>
      <p>
        <a target="_blank" href="https://www.npmjs.com/package/@stomp/stompjs">
          STOMP前端库-ts版
        </a>
        &nbsp;&nbsp;&nbsp;
        <a
          target="_blank"
          href="https://stomp-js.github.io/guide/stompjs/using-stompjs-v5.html"
        >
          STOMP示例教程
        </a>
        &nbsp; | &nbsp;
        <a target="_blank" href="https://www.npmjs.com/package/stompjs">
          STOMP前端库-JS版
        </a>
      </p>
    </div>

    <div class="block-list">
      <div
        class="block-item"
        v-for="(blockHeader, index) in blockHeaderList"
        :key="index"
      >
        <div class="height">#{{ blockHeader.height }}</div>
        <div class="count">交易数：{{ blockHeader.count }}笔</div>
        <div class="id">
          id：<span>{{ blockHeader.id }}</span>
        </div>
      </div>
    </div>

    <div class="transfer-notify">
      <div class="loops">
        <div class="title">实时到账信息:</div>
        <div class="item" v-for="(transfer, index) in transfers" :key="index">
          <div class="id">
            <span class="key">哈希：</span
            ><span class="value">{{ transfer.id }}</span>
          </div>
          <div class="from">
            <span class="key">发送：</span
            ><span class="value">{{ transfer.from }}</span>
          </div>
          <div class="to">
            <span class="key">接收：</span
            ><span class="value">{{ transfer.to }}</span>
          </div>
          <div class="type">
            <span class="key">类型：</span
            ><span class="value">{{ transfer.transferType }}</span>
          </div>
          <div class="contractAddress" v-if="transfer.contractAddress">
            <span class="key">合约：</span
            ><span class="value">{{ transfer.contractAddress }}</span>
          </div>
          <div class="assetName" v-if="transfer.assetName">
            <span class="key">合约：</span
            ><span class="value">{{ transfer.assetName }}</span>
          </div>
          <div class="amount">
            <span class="key">金额：</span
            ><span class="value">{{ transfer.amount }}</span>
          </div>
          <div class="status">
            <span class="key">状态：</span
            ><span class="value">{{ transfer.status }}</span>
          </div>
          <div class="broadcastTime">
            <span class="key">时间：</span
            ><span class="value">{{ transfer.broadcastTime }}</span>
          </div>
        </div>
      </div>
      <div class="notify-form">
        <el-form :model="args" label-width="100px">
          <el-form-item label="监听地址">
            <el-input
              v-model="args.address"
              placeholder="Tron账户地址(Base58)"
            />
          </el-form-item>
          <el-form-item label="转账类型">
            <el-select v-model="args.transferType" placeholder="请选择转账类型">
              <el-option label="TRX" :value="TransferType.TRX" />
              <el-option label="TRC20" :value="TransferType.TRC20" />
              <el-option label="TRC10" :value="TransferType.TRC10" />
            </el-select>
          </el-form-item>
          <el-form-item label="合约目标">
            <el-input
              v-model="args.contractTarget"
              placeholder="trc20 合约地址 | trc10 资源ID"
            />
          </el-form-item>
          <el-space fill>
            <el-alert type="info" show-icon :closable="false">
              <p>
                系统默认Trx最低通知金额为1000000（一个，不得低于此数值），其他合约请计算好精度填写。不清楚则保持默认0
              </p>
            </el-alert>
            <el-form-item label="最低通知金额">
              <el-input v-model="args.minAmount" type="number" />
            </el-form-item>
          </el-space>
          <el-form-item label="回调网址">
            <el-input
              v-model="args.callbackUrl"
              placeholder="系统将主动请求该地址，暂不可用"
              disabled
            />
          </el-form-item>
          <el-form-item v-if="args_err">
            <span class="err">{{ args_err }}</span>
          </el-form-item>
          <el-form-item>
            <el-button style="width: 100%" @click="ok">确定</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="container">
      <p>
        <b>指定高度查询区块信息(最近100个块以内)：</b>
        {{ api }}/getBlockInfoByHeight/<span style="color: red">{{
          latestBlockHeight
        }}</span>
      </p>
      <p>
        提醒：websocket长连接存在断线风险，这是也是需要提供独立API查询指定区块信息的原因。
      </p>
      <p>
        可以在自己的软件中设置，定时每3秒从本页API获取区块信息。或接收ws信息，实现自定义重连"补帧"逻辑
      </p>
    </div>

    <div class="container">
      <p>
        代码已开源 &nbsp;&nbsp;&nbsp;
        <a href="https://github.com/Aiden-777/onecall-vue" target="_blank">
          前端
        </a>
        &nbsp;&nbsp;&nbsp;
        <a href="https://github.com/Aiden-777/onecall" target="_blank">后端</a>
      </p>
      <p>
        相关问题咨询或其他业务需求请联系 -
        <a target="_blank" href="https://t.me/Aiden_777">Aiden</a>
      </p>
      <p>Donate：TTTTTtczA5UZM65QJpncXUsH8KwgJTHyXw</p>
    </div>

    <div class="container">
      <div class="data-block-header">
        <div>订阅 <strong>/block-header</strong> 返回数据：</div>
        <pre class="code">
        <code>
{
  "id":"0000000001b1f0732a5a0457c810bbfccabe255d5ce603999e8dee47518af2ab",
  "height":28438643,
  "count":2
}
        </code>
          </pre>
      </div>

      <div class="data-block">
        <div>订阅 <strong>/block</strong> 返回数据：</div>
        <pre class="code">
        <code>
{
  "header":{
      "id":"0000000001b1f0732a5a0457c810bbfccabe255d5ce603999e8dee47518af2ab",
      "height":28438643,
      "count":3
  },
  "transfers":[
      {
          "id":"3c46a213a4e6e760e01dccb23e58585663d29de633319316ca8449ce850d8bba",
          "transferType":"TRX",
          "from":"TMEZm1EJSm7uDUQjRE48YSmdhwxGNo1111",
          "to":"TMMWLNUUaSnAiif7KY8fPBxyR9wyaF8222",
          "amount":"36200",
          "status":"SUCCESS"
      },
      {
          "id":"fb3d46d87d26d5fb7a96ccca0e7c70bc52942345150f9183754654db4aede1d0",
          "transferType":"TRC20",
          "contractAddress":"TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
          "from":"TBB3jfSew1ygkwhFf4Fjqq3LLSys77777P",
          "to":"TH33333nekHyQkBmxGhUPQjyBcCY3J1ceK",
          "amount":"1000000",
          "status":"SUCCESS",
          "contractAddress":"TFd1piJ8iXmJQicTicq4zChDSNSMLPFR4w"
      },
      {
          "id":"fb3d46d87d26d5fb7a96ccca0e7c70bc52942345150f9183754654db4aede1d0",
          "transferType":"TRC10",
          "assetName":"564826",
          "from":"TBB3jfSew1ygkwhFf4Fjqq3LLSys77777P",
          "to":"TH33333nekHyQkBmxGhUPQjyBcCY3J1ceK",
          "amount":"1000000",
          "status":"SUCCESS",
          "contractAddress":"TFd1piJ8iXmJQicTicq4zChDSNSMLPFR4w"
      }
  ]
}
        </code>
          </pre>
      </div>

      <div class="ts-types">
        <div>
          <strong>TS类型</strong> -
          <small style="color: gray">TronTypes.ts</small>
        </div>
        <pre class="code">
        <code>
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
  transfers: Array&lt;TransferInfo&gt;;
}

export interface CallbackNotify {
  address: string;
  transferType: TransferType;
  contractTarget: string;
  minAmount: string;
  callbackUrl: string;
}
        </code>
          </pre>
      </div>
    </div>
  </main>
</template>

<style lang="less">
.block-list {
  display: flex;
  flex-direction: row;

  line-height: 2rem;
  .block-item {
    padding: 1rem 1.5rem;
    width: 24%;
    max-width: 175px;
    border-radius: 5%;
    box-sizing: border-box;
    background: white;
    overflow: hidden;
    box-shadow: 5px 5px 10px 0 #eee;
    &:not(:last-child) {
      margin-right: 1rem;
    }
    .height {
      color: black;
      font-size: 1.1rem;
      font-weight: bold;
    }
    .id {
      display: flex;

      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        direction: rtl;
      }
    }
  }
}

pre {
  font-size: 0.9rem;
}

.transfer-notify {
  padding: 1rem;
  display: flex;
  background: white;
  line-height: 1.6em;
  & > div {
    box-sizing: border-box;
  }
}
.transfer-notify .loops {
  padding: 1rem;
  width: 50%;
  min-width: 50%;
  max-height: 388px;
  background: #eee;
  font-size: 0.8rem;
  overflow: auto;
  &::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 5px; /*高宽分别对应横竖滚动条的尺寸*/
    height: 10px;
  }
  &::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/
    border-radius: 10px;
    background: #a3a3a3;
  }
  &::-webkit-scrollbar-track {
    /*滚动条里面轨道*/
    border-radius: 10px;
    background: #ffdfb8;
  }
  .title {
    padding-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    border-bottom: 2px solid #d1d1d1;
  }
  .item {
    &:not(:last-child) {
      padding-bottom: 0.5rem;
      border-bottom: 1px dashed gray;
    }
    &:not(:first-child) {
      padding-top: 0.5rem;
    }
    & > div span.key {
      display: inline-block;
      width: 3em;
      text-align: right;
    }
    .id {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .to span.value {
      font-weight: 600;
      color: green;
    }
  }
}

.code {
  overflow: auto;
}
.notify-form {
  .err {
    color: red;
    font-size: 0.8rem;
  }
}

@media (min-width: 320px) and (max-width: 480px) {
  .block-list {
    flex-direction: column;
    .block-item {
      margin: 0.5rem;
      width: auto;
      max-width: none;
      border-radius: 4px;
    }
  }
  .transfer-notify {
    flex-direction: column;
  }
  .transfer-notify .loops {
    width: auto;
    min-height: 15rem;
    margin-bottom: 1rem;
  }
}
</style>
