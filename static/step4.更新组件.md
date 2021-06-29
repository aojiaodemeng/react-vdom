# 一、类组件的更新

## 1.创建并渲染一个类组件

```javascript
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

```javascript
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

```javascript
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

```javascript
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

# 二、不是同一个组件的情况

## 1.diff 方法——判断要更新的是 VDom 是否是组件，并调用 diffComponent 方法

```javascript
export default function diff(virtualDOM, container, oldDOM) {
    const oldComponent = oldVirtualDOM && oldVirtualDOM.component;
    if(!oldDOM){...}else if (typeof virtualDOM.type === "function") {
        // 要更新的是组件
        // 1) 组件本身的 virtualDOM 对象 通过它可以获取到组件最新的 props
        // 2) 要更新的组件的实例对象 通过它可以调用组件的生命周期函数 可以更新组件的 props 属性 可以获取到组件返回的最新的 Virtual DOM
        // 3) 要更新的 DOM 象 在更新组件时 需要在已有DOM对象的身上进行修改 实现DOM最小化操作 获取旧的 Virtual DOM 对象
        // 4) 如果要更新的组件和旧组件不是同一个组件 要直接将组件返回的 Virtual DOM 显示在页面中 此时需要 container 做为父级容器
        diffComponent(virtualDOM, oldComponent, oldDOM, container)
    }
}
```

## 2.diffComponent 方法——判断是否是同一个组件，如果不是同一个组件就不需要做组件更新操作，直接调用 mountElement 方法将组件返回的 Virtual DOM 添加到页面中。

```javascript
import mountElement from "./mountElement";
export default function diffComponent(
  virtualDOM,
  oldComponent,
  oldDOM,
  container
) {
  if (isSameComponent(virtualDOM, oldComponent)) {
    // 同一个组件，进行组件更新操作
    console.log("同一个组件，进行组件更新操作");
  } else {
    // 先删除原来的组件
    mountElement(virtualDOM, container, oldDOM);
  }
}

// 判断是否是同一个组件
function isSameComponent(virtualDOM, oldComponent) {
  return oldComponent && virtualDOM.type === oldComponent.constructor;
}
```

## 3.mountElement 方法——新增 oldDOM 参数，作用是在将 DOM 对象插入到页面前 将页面中已存在的 DOM 对象删除 否则无论是旧 DOM 对象还是新 DOM 对象都会显示在页面中

## 4.mountNativeElement 方法——删除原有的旧 DOM 对象

```javascript
export default function mountNativeElement(virtualDOM, container, oldDOM) {
  // 如果旧的DOM对象存在 删除
  if (oldDOM) {
    unmount(oldDOM);
  }
  ...
}
```

# 三、同一个组件的情况

## 1.先在 Component 类中添加生命周期函数，子类要使用的话直接覆盖就可以

```javascript
// Component.js
export default class Component {
  // 生命周期函数
  componentWillMount() {}
  componentDidMount() {}
  componentWillReceiveProps(nextProps) {}
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps != this.props || nextState != this.state;
  }
  componentWillUpdate(nextProps, nextState) {}
  componentDidUpdate(prevProps, preState) {}
  componentWillUnmount() {}
}
```

## 2.diffComponent 里，增加同一个组件情况更新时调用 updateComponent 方法

```javascript
// diffComponent.js
if (isSameComponent(virtualDOM, oldComponent)) {
  // 属同一个组件 做组件更新
  updateComponent(virtualDOM, oldComponent, oldDOM, container);
}
```

## 3.新建 updateComponent 方法用于更新组件操作

在 updateComponent 方法中调用组件的生命周期函数，更新组件获取最新 Virtual DOM，最终调用 diff 方法进行更新

```javascript
// updateComponent.js
export default function updateComponent(
  virtualDOM,
  oldComponent,
  oldDOM,
  container
) {
  // 生命周期函数
  oldComponent.componentWillReceiveProps(virtualDOM.props);
  if (
    // 调用 shouldComponentUpdate 生命周期函数判断是否要执行更新操作
    oldComponent.shouldComponentUpdate(virtualDOM.props)
  ) {
    // 将未更新的 props 保存一份
    let prevProps = oldComponent.props;
    // 生命周期函数
    oldComponent.componentWillUpdate(virtualDOM.props);
    // 更新组件的 props 属性 updateProps 方法定义在 Component 类型
    oldComponent.updateProps(virtualDOM.props);
    // 因为组件的 props 已经更新 所以调用 render 方法获取最新的 Virtual DOM
    const nextVirtualDOM = oldComponent.render();
    // 将组件实例对象挂载到 Virtual DOM 身上
    nextVirtualDOM.component = oldComponent;
    // 调用diff方法更新视图
    diff(nextVirtualDOM, container, oldDOM);
    // 生命周期函数
    oldComponent.componentDidUpdate(prevProps);
  }
}
```
