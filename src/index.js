import TReact from "./TReact";
const root = document.getElementById("root");
const virtualDOM = (
  <div className="container">
    <h1>你好 Tiny React</h1>
    <h2 data-test="test">(编码必杀技)</h2>
    <div>
      嵌套1 <div>嵌套 1.1</div>
    </div>
    <h3>(观察: 这个将会被改变)</h3>
    {2 == 1 && <div>如果2和1相等渲染当前内容</div>}
    {2 == 2 && <div>2</div>}
    <span>这是一段内容</span>
    <button onClick={() => alert("你好")}>点击我</button>
    <h3>这个将会被删除</h3>
    2, 3
    <input type="text" value="13" />
  </div>
);
const modifyDOM = (
  <div className="container">
    <h1>你好 Tiny React2</h1>
    <h2 data-test="test123">(编码必杀技)</h2>
    <div>
      嵌套1 <div>嵌套 1.1</div>
    </div>
    <h3>(观察: 这个将会被改变)</h3>
    {2 == 1 && <div>如果2和1相等渲染当前内容</div>}
    {2 == 2 && <div>2</div>}
    {/* <span>这是一段被修改过的内容</span> */}
    <button onClick={() => alert("你好！！！！！")}>点击我</button>
    <h6>这个将会被删除</h6>
    2, 3
    <input type="text" value="13" />
  </div>
);

class Alert extends TReact.Component {
  constructor(props) {
    super(props);
    this.state = { title: "default title" };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({ title: "changed title" });
  }
  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps", nextProps);
  }
  componentWillUpdate() {
    console.log("componentWillUpdate");
  }
  componentDidUpdate() {
    console.log("componentDidUpdate");
  }
  render() {
    return (
      <div>
        {this.props.name}
        {this.props.age}
        <div>
          {this.state.title}
          <button onClick={this.handleClick}>改变title</button>
        </div>
      </div>
    );
  }
}
class Alert1 extends TReact.Component {
  constructor(props) {
    super(props);
    this.state = { title: "default title" };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({ title: "changed title" });
  }

  render() {
    return (
      <div>
        {this.props.name}
        {this.props.age}
        <div>
          {this.state.title}
          <button onClick={this.handleClick}>dalskndkjan</button>
        </div>
      </div>
    );
  }
}

class DemoRef extends TReact.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    console.log(this.input.value);
    console.log(this.alert);
  }

  componentDidMount() {
    console.log("componentDidMount");
  }
  render() {
    return (
      <div>
        <input type="text" ref={(input) => (this.input = input)} />
        <button onClick={this.handleClick}>按钮</button>
        <Alert name="2" ref={(alert) => (this.alert = alert)} />
      </div>
    );
  }
}
TReact.render(<DemoRef />, root);
