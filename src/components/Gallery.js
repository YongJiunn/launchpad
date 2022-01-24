import IconService from "icon-sdk-js";
// import "./app_content.css";
// import React, { Component } from "react";
// import "./global.css";
// import "./style.css";
import React, { Component } from "react";
import { Image, Grid, GridItem, Flex, Button, Box, Text, Select, Center, HStack, ButtonGroup, SimpleGrid, Link } from '@chakra-ui/react'
import { Scrollbar } from 'smooth-scrollbar-react';
import ICONexConnection from "./utils/interact.js";
const axios = require("axios");
const { IconBuilder } = IconService;

class Gallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      metahash: this.props.metahash,
      uploadedFiles: [],
      thumbnailFiles: [],
    };
    const provider = new IconService.HttpProvider(
      "https://sejong.net.solidwallet.io/api/v3"
    );
    this.jsonhash = "";
    this.jsonthumbnailhash = "";
    this.iconService = new IconService(provider);
    this.contractAddress = localStorage.getItem("SELECTED_CONTRACT_ADDRESS");
    this.mintedLink = [];
    this.gateway = ['astyanax.io', 'ipfs.io', 'ipfs.infura.io', 'infura-ipfs.io', 'ipfs.eth.aragon.network', 'cloudflare-ipfs.com', 'ipfs.fleek.co', 'cf-ipfs.com', 'gateway.pinata.cloud', 'cf-ipfs.com', 'astyanax.io', 'infura-ipfs.io', 'ipfs.kxv.io'];


  }
  getJSONFileMetahash = async () => {
    const callObj = new IconBuilder.CallBuilder()
      .from(null)
      .to(this.contractAddress)
      .method("getJSONFileMetahash")
      .build();

    let result = await this.iconService
      .call(callObj)
      .execute()
      .then((response) => {
        console.log("getJSONFileMetahash", response);
        this.jsonhash = response;
      })
      .catch((error) => {
        console.log("getJSONFileMetahash", error);
        Promise.resolve({ error });
      });
    return result;
  };

  getJSONThumbnailMetahash = async () => {
    const callObj = new IconBuilder.CallBuilder()
      .from(null)
      .to(this.contractAddress)
      .method("getJSONThumbnailMetahash")
      .build();

    let result = await this.iconService
      .call(callObj)
      .execute()
      .then((response) => {
        console.log("getJSONThumbnailMetahash", response);
        this.jsonthumbnailhash = response;
      })
      .catch((error) => {
        console.log("getJSONThumbnailMetahash", error);
        Promise.resolve({ error });
      });
    return result;
  };

  async componentDidMount() {
    await this.getJSONFileMetahash();
    console.log(this.jsonhash)
    const pinataEndpoint3 = `https://gateway.pinata.cloud/ipfs/${this.jsonhash}`;
    let json_upload_response = await axios
      .get(pinataEndpoint3)
      .then((response) => {
        this.setState({ uploadedFiles: response.data.files_link });
      })
      .catch((error) => {
        console.log(error);
      });

    await this.getJSONThumbnailMetahash();
    console.log(this.jsonthumbnailhash)
    const pinataEndpoint4 = `https://gateway.pinata.cloud/ipfs/${this.jsonthumbnailhash}`;
    let json_upload_response2 = await axios
      .get(pinataEndpoint4)
      .then((response) => {
        console.log(response)
        this.setState({ thumbnailFiles: response.data.files_link });
      })
      .catch((error) => {
        console.log(error);
      });

    let rounds = this.state.thumbnailFiles.length / this.gateway.length;
    if (rounds <= 1) {
      this.setState({ gateway: this.gateway });
    }
    else if (rounds > Math.floor(rounds)) {
      this.gateway = Array(Math.ceil(rounds)).fill(this.gateway).flat();
      this.setState({ gateway: this.gateway });
    }
    else {
      this.gateway = Array(rounds).fill(this.gateway).flat();
      this.setState({ gateway: this.gateway });
    }

  }

  render() {
    console.log(this.state.thumbnailFiles);
    return (
      // <div>
      //     {(this.state.uploadedFiles).map((data) => <li>{data}</li>)}
      // </div>
      // <div id="gallery" className="row mx-2" >
      //   {this.state.thumbnailFiles.map((data, index) => (
      //     <div className="col-lg-4 col-md-12 mt-4 mb-lg-0">
      //       <a
      //         target="_blank"
      //         rel="noreferrer"
      //         href={this.state.uploadedFiles[index].link}
      //       >
      //         <img src={"https://" + this.gateway[index] + data.link.slice(28)} className="w-100 shadow-1-strong rounded" />
      //         <span>{data.name}</span>
      //       </a>
      //     </div>
      //   ))}
      // </div>


      <SimpleGrid columns={4} overflow={"auto"} marginRight={"auto"} marginLeft={"auto"}
        columns={4}
        spacing='5'
        p='10'
      >
        {this.state.thumbnailFiles.map((data, index) => (
          // <div className="col-lg-4 col-md-12 mt-4 mb-lg-0">
          //   <a
          //     target="_blank"
          //     rel="noreferrer"
          //     href={this.state.uploadedFiles[index].link}
          //   >
          //     <img src={"https://" + this.gateway[index] + data.link.slice(28)} className="w-100 shadow-1-strong rounded" />
          //     <span>{data.name}</span>
          //   </a>
          // </div>
          <Box>
            <Link target="_blank" href={this.state.uploadedFiles[index].link}>
              <Image src={"https://" + this.gateway[index] + data.link.slice(28)} width={"100%"} boxShadow='md' rounded='md' />
              <Text
                layerStyle="card_content"
                textAlign="center"
                color="white"
                mt={1}
              >
                {data.name}
              </Text>
            </Link>
          </Box>
        ))
        }
      </SimpleGrid>


    );
  }
}

export default Gallery;
