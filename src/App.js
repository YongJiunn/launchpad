import React, { Component } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./components/style.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CollectionComponent from "./components/CollectionComponent.js";
import FileComponent from "./components/FileComponent.js";
import LaunchComponent from "./components/LaunchComponent.js";
import Usergallery from "./components/Usergallery";
import LandingComponent from "./components/LandingComponent";
import NavigationComponent from "./components/NavigationComponent";
import GenerateComponent from "./components/GenerateComponent";
import { Box } from "@chakra-ui/react";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user_contract_address: null,
      user_walletaddress: null,
      user_contract_title: null,
    };
  }

  componentDidMount() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    this.setState({ user_contract_address: urlParams.get("collection") });
    this.setState({ user_walletaddress: urlParams.get("user") });
    this.setState({ user_contract_title: urlParams.get("title") });
    console.log(this.state.user_contract_address);
    console.log(this.state.user_walletaddress);
  }

  setWalletState = (walletAddress) => {
    this.setState({ user_walletaddress: walletAddress });
  };

  render() {
    return (
      <>
        {this.state.user_contract_address != null &&
        this.state.user_walletaddress != null ? (
          <Router>
            <Routes>
              <Route
                exact
                element={
                  <Usergallery
                    pageTitle="Usergallery"
                    contract_address={this.state.user_contract_address}
                    wallet_address={this.state.user_walletaddress}
                    contract_name={this.state.user_contract_title}
                  />
                }
                path="/Usergallery"
              ></Route>
            </Routes>
          </Router>
        ) : localStorage.getItem("USER_WALLET_ADDRESS") == null &&
          this.state.user_contract_address == null ? (
          <Router>
            <Routes>
              <Route
                exact
                element={<LandingComponent setwallet={this.setWalletState} />}
                path="/"
              ></Route>
            </Routes>
          </Router>
        ) : (
          <Router>
            <NavigationComponent></NavigationComponent>
            <Box minH="calc(100vh - 70px)" bg={"#202225"}>
              <Box mx="auto" maxW="1300px" px={"5"}>
                <Routes>
                  <Route
                    exact
                    element={<CollectionComponent />}
                    path="/"
                  ></Route>

                  <Route
                    exact
                    element={<CollectionComponent />}
                    path="/collection"
                  ></Route>
                  <Route exact element={<FileComponent />} path="/file"></Route>
                  <Route
                    exact
                    element={<LaunchComponent />}
                    path="/launch"
                  ></Route>
                  <Route
                    exact
                    element={<GenerateComponent />}
                    path="/generate"
                  ></Route>
                </Routes>
              </Box>
            </Box>
          </Router>
        )}
      </>
    );
  }
}

export default App;
