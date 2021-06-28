# 一、类组件的更新

## 1.创建并渲染一个类组件

```
import TReact from "./TReact";
const root = document.getElementById("root");

class Alert extends TReact.Component {
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
          <button onClick={this.handleClick}>改变title</button>
        </div>
      </div>
    );
  }
}
TReact.render(<Alert />, root);
```

## 2.类 Component

### 2-1.更改子类的 state

setState 方法中，通过调用 this.state 改变了子类的 state。因为 setState 方法是在子类中调用的，因此 this 指向的是子类

### 2-2.获取并比对新旧 VDom，并进行渲染

通过调用 this.render 方法，获取到最新的要渲染的 virtualDOM 对象
旧的 virtualDOM 保存在页面的 dom 对象中

```
export default class Component {
  // 在子类中调用super其实就是调用这个父类的constructor
  constructor(props) {
    // 这样父类就有this.props属性了，子类继承父类，因此子类也有了this.props属性
    this.props = props;
  }
  setState(state) {
    this.state = Object.assign({}, this.state, state);
    // 获取最新的要渲染的 virtualDOM 对象
    let virtualDOM = this.render();
    // 获取旧的virtualDOM对象进行比对
    let oldDOM = this.getDOM();
    let container = oldDOM.parentNode;
    diff(virtualDOM, container, oldDOM);
  }
  setDOM(dom) {
    this._dom = dom;
  }
  getDOM() {
    return this._dom;
  }
}
```

## 3.在处理类组件的方法中，用 component 属性保存组件的实例对象

```
function buildClassComponent(virtualDOM) {
  // 这里的参数virtualDOM.props，其实是传递给了类组件里的constructor
  const component = new virtualDOM.type(virtualDOM.props || {});
  // 通过实例对象去调用render函数
  const nextVirtualDom = component.render();
  // 用component属性保存组件的实例对象
  nextVirtualDom.component = component;
  return nextVirtualDom;
}
```

## 4.获取组件的实例对象，并调用类 Component 的 setDOM 方法，将旧的 DOM 保存下来

```
export default function mountNativeElement(virtualDOM, container) {
  const newElement = createDOMElement(virtualDOM);
  // 将转换之后的DOM对象放置在页面中
  container.appendChild(newElement);
  // 要调用component类中的setDOM方法，需要获取到组件的实例对象
  let component = virtualDOM.component;
  if (component) {
    component.setDOM(newElement);
  }
}
```
