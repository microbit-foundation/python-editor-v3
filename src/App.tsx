import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import Main from "./Main";
import theme from "./theme";
import "./App.css";

const App = () => (
  <ChakraProvider theme={theme}>
    <Main />
  </ChakraProvider>
);

export default App;
