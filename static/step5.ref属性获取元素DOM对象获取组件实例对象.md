# 一、给元素和组件添加 ref 属性

给组件添加 ref 属性，是获取该组件的实例对象。

为节点添加 ref 属性可以获取到这个节点的 DOM 对象，比如在 DemoRef 类中，为 input 元素添加了 ref 属性，目的是获取 input DOM 元素对象，在点击按钮时获取用户在文本框中输入的内容。

```javascript
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
```

# 二、在创建节点时将创建出来的 DOM 对象传递给 ref 所存储的方法

实现思路是在创建节点时判断其 Virtual DOM 对象中是否有 ref 属性，如果有就调用 ref 属性中所存储的方法并且将创建出来的 DOM 对象作为参数传递给 ref 方法，这样在渲染组件节点的时候就可以拿到元素对象并将元素对象存储为组件属性了。

```javascript
// createDOMElement.js
if (virtualDOM.props && virtualDOM.props.ref) {
  virtualDOM.props.ref(newElement);
}
```

# 三、在挂载类组件完成后，调用 ref 方法

实现思路是在 mountComponent 方法中，如果判断了当前处理的是类组件，就通过类组件返回的 Virtual DOM 对象中获取组件实例对象，判断组件实例对象中的 props 属性中是否存在 ref 属性，如果存在就调用 ref 方法并且将组件实例对象传递给 ref 方法。

```javascript
// mountComponent.js
export default function mountComponent(virtualDOM, container, oldDOM) {
  let nextVirtualDOM = null;
+ let component = null;
  // 判断组件是类组件还是函数组件
  if (isFunctionComponent(virtualDOM)) {
    // 函数组件
    nextVirtualDOM = buildFunctionComponent(virtualDOM);
  } else {
    // 类组件
    nextVirtualDOM = buildClassComponent(virtualDOM);
+   component = nextVirtualDOM.component;
  }

  if (isFunction(nextVirtualDOM)) {
    // 函数组件返回的virtualDOM还是一个函数组件
    mountComponent(nextVirtualDOM, container, oldDOM);
  } else {
    // 函数组件返回的virtualDOM是一个基本元素（有可能是下面两种情况
    // <div> 基本元素 </div>
    // <div> 包含了函数组件 <Text /> </div>）
    mountNativeElement(nextVirtualDOM, container, oldDOM);
  }
// 此时组件已挂载完毕，可以调用componentDidMount
+ if (component) {
+   if (component.props && component.props.ref) {
+     component.props.ref(component);
+   }
+ }
}
```
