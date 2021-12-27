import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import IconService from "icon-sdk-js";
import ICONexConnection from "./utils/interact.js";
import PinataModal from "./PinataModal.js";
import Dexie from "dexie";
import "./style.css";
import Dropzone from "./Dropzone.js";
import Gallery from "./Gallery.js";

export class FileComponent extends Component {
  // 1. Get the collection hash address
  // 2. call builder to the hash address
  // 3. Get metahash of the folder that contains all the metadata of file uploaded in this collection
  // 4. Transfer to file page

  //4. If metahash exist, proceed to pull all file out
  // 5. If metahash does not exist, proceed to show interface for drag and drop
  constructor(props) {
    super(props);

    this.state = {
      showPinataModal: false,
      pinataKey: null,
      pinataSecret: null,
      hasMetahash: localStorage.getItem("HAS_METAHASH"),
    };

    const provider = new IconService.HttpProvider(
      "https://sejong.net.solidwallet.io/api/v3"
    );
    this.contract_metahash = "";
    this.iconService = new IconService(provider);
    this.contractAddress = localStorage.getItem("SELECTED_CONTRACT_ADDRESS");
    this.walletAddress = localStorage.getItem("USER_WALLET_ADDRESS");

    this.db = new Dexie("contracts_deployed");
    this.db.version(1).stores({
      contracts: "contractAddress, walletAddress, name, symbol, metahash_exist",
    });
    this.db.open().catch((error) => {
      console.log("error", error);
    });
  }
  connection = new ICONexConnection();

  async dragORfiles(contractAddress) {}

  async componentDidMount() {
    if (this.walletAddress == null) {
      alert("Please connect your wallet.");
      return;
    }
    if (this.contractAddress == null) {
      alert("you need to select a contract to view files");
      window.history.back();
      return;
    }

    document.getElementById("_pageTitle").innerText = this.props.pageTitle;

    //check if user has configured pinata cloud api
    this.state.pinataKey = localStorage.getItem("PINATA_KEY");
    this.state.pinataSecret = localStorage.getItem("PINATA_SECRET");
    if (this.state.pinataKey == null || this.state.pinataSecret == null) {
      this.showPinataModal(); //configure to continue
    }

    console.log("filecomponent", this.state.hasMetahash);
    //this.db.contracts.update(this.contractAddress, { metahash_exist: true }); //update metahash_exists
    //check if the adddress has file
    //set isactive to true
  }

  // updateMetahash = async (metahash) => {
  //   const txObj = new IconBuilder.CallTransactionBuilder()
  //     .from(this.walletAddress)
  //     .to(this.contractAddress)
  //     .stepLimit(IconConverter.toBigNumber(2000000))
  //     .nid("0x53")
  //     .nonce(IconConverter.toBigNumber(1))
  //     .version(IconConverter.toBigNumber(3)) //constant
  //     .timestamp(new Date().getTime() * 1000)
  //     .method("setMetahash")
  //     .params({ _metahash: metahash })
  //     .build();
  //   console.log("txobj", txObj);
  //   const payload = {
  //     jsonrpc: "2.0",
  //     method: "icx_sendTransaction",
  //     id: 6639,
  //     params: IconConverter.toRawTransaction(txObj),
  //   };
  //   console.log("payload", payload);
  //   let rpcResponse = await this.connection.getJsonRpc(payload);
  //   console.log("rpcresponse", rpcResponse);
  //   console.log("fuck u")
  // };

  showPinataModal = () => {
    this.setState({ showPinataModal: true });
  };

  hidePinataModal = () => {
    if (
      localStorage.getItem("PINATA_KEY") != null &&
      localStorage.getItem("PINATA_SECRET") != null
    ) {
      this.setState({ showPinataModal: false });
    }
  };

  render() {
    return (
      <div style={{ height: "75vh", overflowY: "auto" }}>
        {this.state.hasMetahash == "true" ? (
          <Gallery metahash={this.contract_metahash} />
        ) : (
          <Dropzone />
        )}
        <Modal show={this.state.showPinataModal} onHide={this.hidePinataModal}>
          <PinataModal hideModal={this.hidePinataModal} />
        </Modal>
      </div>
    );
  }
}

export default FileComponent;
