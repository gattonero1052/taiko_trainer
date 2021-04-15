import React from "react";
import {DefaultGameState} from "./game";

const GameContext = React.createContext(DefaultGameState);

export {GameContext}