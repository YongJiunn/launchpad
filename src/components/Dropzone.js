import "./app_content.css";
import React, { Component } from "react";
import { Col, Row, Button } from "react-bootstrap";
import "./global.css";
const axios = require("axios");

class Dropzone extends Component {
  uploadedFiles = [];
  constructor(props) {
    super(props);
    this.state = {
      file: this.uploadedFiles,
      pinataAuthenticated: "hello",
    };
    this.pinataKey = localStorage.getItem("pinataKey");
    this.pinataSecret = localStorage.getItem("pinataSecret");
  }

  handleBrowseFiles = (event) => {
    this.fileUploader.click();
    event.preventDefault();
  };

  handleUploadFiles = async () => {
    if (this.uploadedFiles.length == 0) {
      alert("no files found, please upload file");
    }

    let data = new FormData();
    for (var i = 0; i < this.uploadedFiles.length; i++) {
      console.log(this.uploadedFiles[i]);
      data.append(
        `file`,
        this.uploadedFiles[i].dataFile,
        `file/${this.uploadedFiles[i].name}`
      );
    }



    const pinataEndpoint = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    let response = await axios
      .post(pinataEndpoint, data, {
        maxContentLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
          pinata_api_key: "295a526cef20b63d813c",
          pinata_secret_api_key:
            "f57c393914f6a30ac78b7a8641726a62c7285d12014adfe56e52686d5fdb03ff",
        },
      })
      .then((res) => {
        console.log("file", res);
        console.log(data.toString());
        return res;
      });

    const ipfsHash = response.data.IpfsHash;
    const ipfsGateway = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`; //gateway might change so its stored as ipfs:// ; opensea decides gateway
    let mdata = new FormData();
    for (var i = 0; i < this.uploadedFiles.length; i++) {
      //create metadata file
      const mdataContent = {
        image: `${ipfsGateway}/${this.uploadedFiles[i].name}`,
      };
      const mdataFile = new File([JSON.stringify(mdataContent)], `${i}.json`, {
        type: "application/json",
      });
      mdata.append(`file`, mdataFile, `mdata/${i}.json`);
    }

    let mresponse = await axios
      .post(pinataEndpoint, mdata, {
        maxContentLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
          pinata_api_key: "295a526cef20b63d813c",
          pinata_secret_api_key:
            "f57c393914f6a30ac78b7a8641726a62c7285d12014adfe56e52686d5fdb03ff",
        },
      })
      .then((res) => {
        console.log("metadata", res);
        console.log(data.toString());
        return res;
      });
  };

  handleDropFiles = async (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    for (var i = 0; i < files.length; i++) {
      const imgBlob = URL.createObjectURL(files[i]);
      this.uploadedFiles.push({
        name: files[i].name,
        blob: imgBlob,
        dataFile: files[i],
      });
    }

    this.setState({ file: this.uploadedFiles });
  };

  // handleDropFolder = async (event) => {
  //   event.preventDefault();
  //   const files = event.target.files;

  //   const ipfsHash = "QmVQnSoCbCCTodGMhmnXWUb3sb7jAHQv5Z4S1ktzNdxzjz";
  //   const ipfsGateway = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`; //gateway might change so its stored as ipfs:// ; opensea decides gateway

  //   const metaData = [];
  //   for (var fileIndex = 0; fileIndex < files.length; fileIndex++) {
  //     const imgBlob = URL.createObjectURL(files[fileIndex]);
  //     this.blobData.push({
  //       name: files[fileIndex].name,
  //       blob: imgBlob,
  //       dataFile: files[fileIndex],
  //     });
  //     metaData.push({
  //       image: `${ipfsGateway}/${files[fileIndex].name}`,
  //     });
  //   }
  //   console.log(metaData);

  //   let data = new FormData();
  //   const testFile = new File([JSON.stringify(metaData[0])], "0.json", {
  //     type: "application/json",
  //   });
  //   const testFile2 = new File([JSON.stringify(metaData[0])], "1.json", {
  //     type: "application/json",
  //   });
  //   data.append(`file`, testFile, `metadata/${testFile.name}`);
  //   data.append(`file`, testFile2, `metadata/${testFile2.name}`);
  //   // data.append(`file`, testFile2, { filepath: `./${testFile.name}` });

  //   console.log(testFile);
  //   const pinataEndpoint = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  //   axios
  //     .post(pinataEndpoint, data, {
  //       maxContentLength: "Infinity",
  //       headers: {
  //         "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
  //         pinata_api_key: "295a526cef20b63d813c",
  //         pinata_secret_api_key:
  //           "f57c393914f6a30ac78b7a8641726a62c7285d12014adfe56e52686d5fdb03ff",
  //       },
  //     })
  //     .then((res) => {
  //       console.log(res);
  //       console.log(data.toString());
  //     });

  //   this.setState({ file: this.blobData });
  // };

  remove_file(file_index) {
    // console.log(file_index)
    // console.log(this.uploadedFiles)

    // this.uploadedFiles.splice(file_index, 1)
    let updated_uploadedFile = [];
    for (let i = 0; i < this.uploadedFiles.length; i++) {
      if (i != file_index.i) {
        updated_uploadedFile.push(this.uploadedFiles[i])
      }
    }
    // console.log(updated_uploadedFile)
    this.uploadedFiles = updated_uploadedFile;
    this.setState({ file: this.uploadedFiles });
    // console.log(this.uploadedFiles)


  }

  render() {
    return (
      <>
        <div
          style={{
            padding: "25px 25px",
            border: "1px solid #5d2985",
            borderRadius: "0.25rem",
            maxHeight: "400px",
            overflowY: "auto",
          }}
          onDrop={this.handleDropFiles}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDragEnter={(e) => {
            e.preventDefault();
          }}
          onDragLeave={(e) => {
            e.preventDefault();
          }}
        // onClick={this.handleBrowseFiles}
        >
          <span style={{ color: "#5d2985" }}>drag and drop files</span>
          <div
            id="gallery"
            style={{
              paddingTop: this.uploadedFiles.length == 0 ? "0px" : "5px",
            }}
          >
            <Row>
              {(this.uploadedFiles || []).map((data, i) => (
                <Col key={i} xs={2} style={{ marginBottom: "10px" }}>
                  <div style={{ padding: "5px", position: "relative" }}>
                    <img
                      src={data.blob}
                      style={{
                        width: "100%",
                        display: "block",
                        margin: "auto",
                        border: "1px solid #c9c9c9",
                      }}
                    ></img>
                    <i className="fa fa-times-circle" style={{ fontSize: "30px", color: "red", position: "absolute", top: "0px", right: "-1px" }} onClick={e => this.remove_file({ i })}></i>
                    <span style={{ fontWeight: "bold", fontSize: "12px" }}>
                      {data.name}
                    </span>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>
        <input
          type="file"
          id="files"
          ref={(input) => (this.fileUploader = input)}
          style={{ display: "none" }}
          webkitdirectory=""
          multiple=""
          directory=""
          onChange={this.handleDropFolder}
        ></input>
        <Button
          style={{ float: "right", marginTop: "15px" }}
          onClick={this.handleUploadFiles}
        >
          Upload
        </Button>
      </>
    );
  }
}

export default Dropzone;
