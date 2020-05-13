import {compose, createStore, applyMiddleware} from "redux";
import thunkMiddleware from "redux-thunk";
import reducers from "./reducers";

let composeEnhancers;

if (process.env.NODE_ENV !== "production" && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
  composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
} else {
  composeEnhancers = compose;
}

const store = createStore(reducers, undefined, composeEnhancers(applyMiddleware(thunkMiddleware)));

export default store;
