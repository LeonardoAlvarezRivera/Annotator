import {
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { ReactNode } from "react";
import { Entity } from "./objects/Entity.interface";
import EntitiesManager from "./components/EntitiesManager";
import Anotator from "./components/Anotator";
import Projects from "./components/Projects";


class MyComponent extends StreamlitComponentBase<any> {
  dataFile:any;  

  void =() =>{}

  public render = (): ReactNode => {
    var component:string = this.props.args["tool"]
      return (<div className="container-main"><Projects Component={component}></Projects></div>);  
  }
}

export default withStreamlitConnection(MyComponent);
