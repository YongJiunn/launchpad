import IconService from "icon-sdk-js";
import "../app_content.css";
import axios from "axios";
import cfg from "./../../config.json";

const { IconConverter, IconBuilder, HttpProvider } = IconService;

class ICONexConnection {
  constructor() {
    this.provider = new HttpProvider(
      "https://sejong.net.solidwallet.io/api/v3"
    );
    this.iconService = new IconService(this.provider);
  }
  getWalletAddress() {
    let wallet_address = this.ICONexRequest("REQUEST_ADDRESS");
    return wallet_address;
  }

  async testMint(contractAddress) {
    const txObj = new IconBuilder.CallTransactionBuilder()
      .from(cfg.LOCAL_WALLET_ADDRESS)
      .to(contractAddress)
      .stepLimit(IconConverter.toBigNumber(2000000))
      .nid("0x53")
      .nonce(IconConverter.toBigNumber(1))
      .version(IconConverter.toBigNumber(3)) //constant
      .timestamp(new Date().getTime() * 1000)
      .method("mint")
      .params({
        _owner: cfg.LOCAL_WALLET_ADDRESS,
        _id: "1",
        _supply: "1",
        _uri: "google.com",
      })
      .build();

    const payload = {
      jsonrpc: "2.0",
      method: "icx_sendTransaction",
      id: 6639,
      params: IconConverter.toRawTransaction(txObj),
    };

    let rpcResponse = await this.getJsonRpc(payload);
    console.log(rpcResponse);
  }

  async getLaunchpadContracts(walletAddress) {
    let urlTransactionList = `https://sejong.tracker.solidwallet.io/v3/address/txList?page=1&count=100&address=${walletAddress}`;
    let contractContainer = [];
    let response = await axios.get(urlTransactionList).then((res) => {
      return res.data;
    });

    if (response.data == null) {
      return []; //no tx found
    }

    let totalPages = response.totalSize / 100;
    if (totalPages > Math.floor(totalPages)) {
      totalPages = Math.floor(totalPages) + 1;
    } else if (totalPages < 1) {
      totalPages = 1;
    }

    //filter tx to get contracts
    console.log("total pages", totalPages);
    for (var page = 0; page < totalPages; page++) {
      let urlCurrentPage = `https://sejong.tracker.solidwallet.io/v3/address/txList?page=${
        page + 1
      }&count=100&address=${walletAddress}`;
      const pageResponse = await axios.get(urlCurrentPage).then((res) => {
        return res.data;
      });

      let transactions = pageResponse.data;
      for (let transaction of transactions) {
        if (transaction.txType == "3") {
          contractContainer.push(transaction.targetContractAddr);
        }
      }
    }

    //filter contracts to get isLaunchpad
    //console.log("contract contrainer", contractContainer);
    let contractDisplayed = [];
    for (let contractAddress of contractContainer) {
      let shouldDisplay = await this.deployedByLaunchpad(contractAddress);
      console.log("should", contractAddress, shouldDisplay);
      if (shouldDisplay == true) {
        //get contract_info
        let contractResponse = await axios
          .get(
            `https://sejong.tracker.solidwallet.io/v3/contract/info?addr=${contractAddress}`
          )
          .then((res) => {
            return res.data;
          });
        console.log("contractResponse", contractResponse);

        contractDisplayed.push({
          name: contractResponse.data.tokenName,
          symbol: contractResponse.data.symbol,
          contractAddress: contractAddress,
        });
        if (contractDisplayed.length == 11) {
          break; //show latest 11 contracts; we can change this
        }
      }
    }
    return contractDisplayed;
  }

  async deployedByLaunchpad(contractAddress) {
    //check if its deployed by launchpad
    const callObj = new IconBuilder.CallBuilder()
      .from(null)
      .to(contractAddress)
      .method("createdByLaunchpad")
      .build();

    let result = await this.iconService
      .call(callObj)
      .execute()
      .then((response) => {
        console.log("success");
        return response;
      })
      .catch((error) => {
        Promise.resolve({ error });
        //console.log(error);
        return "0x0";
      });
    return result;
  }

  async hasMetahash(contractAddress) {
    const callObj = new IconBuilder.CallBuilder()
      .from(null)
      .to(contractAddress)
      .method("getMetahash")
      .build();

    let result = await this.iconService
      .call(callObj)
      .execute()
      .then((response) => {
        if (response == null) {
          return false;
        }
        return true;
      })
      .catch((error) => {
        console.log("error", error);
        Promise.resolve({ error });
        //console.log(error);
        return "0x0";
      });
    return result;
  }

  getJsonRpc(jsonRpcQuery) {
    return this.ICONexRequest("REQUEST_JSON-RPC", jsonRpcQuery);
  }

  makeJsonRpcCall(txObj, txMethod) {
    const jsonRpcQuery = {
      jsonrpc: "2.0",
      method: txMethod,
      params: IconConverter.toRawTransaction(txObj),
      id: 1234,
    };
    return this.getJsonRpc(jsonRpcQuery);
  }

  ICONexRequest(requestType, payload) {
    return new Promise((resolve, reject) => {
      function eventHandler(event) {
        const { payload } = event.detail;
        window.removeEventListener("ICONEX_RELAY_RESPONSE", eventHandler);
        resolve(payload);
      }
      window.addEventListener("ICONEX_RELAY_RESPONSE", eventHandler);

      window.dispatchEvent(
        new window.CustomEvent("ICONEX_RELAY_REQUEST", {
          detail: {
            type: requestType,
            payload,
          },
        })
      );
    });
  }
}

export async function estimateStepsforDeployment(from, content, params) {
  const timestampInDecimal = Date.now() * 1000;
  const timestamp = "0x" + timestampInDecimal.toString(16); //to hex string
  const txObj = {
    jsonrpc: "2.0",
    method: "debug_estimateStep",
    id: 1234,
    params: {
      version: "0x3",
      from,
      to: cfg.ZERO_ADDRESS, //selectedNetworkData.CONTRACT_DEPLOY_ADDRESS,
      timestamp,
      nid: "0x53", //0x53 for sejong ; selectedNetworkData.NID,
      nonce: "0x1",
      dataType: "deploy",
      data: {
        contentType: "application/zip",
        content, // compressed SCORE data
        params,
      },
    },
  };
  try {
    const responsePromise = await fetch(
      "https://sejong.net.solidwallet.io/api/v3d", //remember to throw everything into const file
      {
        method: "POST",
        body: JSON.stringify(txObj),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const responseJSON = await responsePromise.json();

    return responseJSON.result;
  } catch (err) {
    console.error("FETCH:", err);
    throw err;
  }
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default ICONexConnection;
