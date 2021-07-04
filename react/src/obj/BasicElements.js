import React from "react";

export class Button extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return;
  }
}

export class Label extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    var darkMode = overrideNull(this.props.darkMode,false);
    var style = overrideNull(this.props.style,{});

    style.color = overrideNull(style.color, darkMode ? "#ffffff" : "#000000");
    style.margin = overrideNull(style.margin, 0);

    return (
      <p style={style}>{this.props.children}</p>
    );
  }
}

//Checks if a possible value is already present, otherwise override with default value
function overrideNull(prop, defaultItem){
  if (prop == null){
    return defaultItem;
  }
  return prop;
}
