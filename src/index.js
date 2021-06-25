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

// 函数组件
function Heart(props) {
  return (
    <div>
      {props.title}
      &hearts;
      <Demo />
    </div>
  );
}

// 函数组件
function Demo() {
  return <div>Demo</div>;
}

// 定义Alert类组件时，它是Component的子类，可以在内部中调用父类，把this.props传递给父类，让父类去执行this.props=props
//
class Alert extends TReact.Component {
  // 通过constructor拿到props
  // 在buildClassComponent这个方法里，实例化时传递进来的
  constructor(props) {
    // 调用super方法将props传递给父类
    super(props);
  }
  render() {
    return (
      <div>
        hello Component
        {this.props.name}
        {this.props.age}
      </div>
    );
  }
}
TReact.render(<Alert name="张三" age={20} />, root);
