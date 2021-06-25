# 一、函数组件的渲染

## 1.src/index.js

```
import TReact from "./TReact";
const root = document.getElementById("root");

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

TReact.render(<Heart title="hello title" />, root);

```

## 2.src/TReact/mountElement.js

```
import mountNativeElement from "./mountNativeElement";
import isFunction from "./isFunction";
import mountComponent from "./mountComponent";

export default function mountElement(virtualDOM, container) {
  if (isFunction(virtualDOM)) {
    // Component
    mountComponent(virtualDOM, container);
  } else {
    //NativeElement
    mountNativeElement(virtualDOM, container);
  }
}
```

## 3.src/TReact/isFunction.js

```
export default function isFunction(virtualDOM) {
  return virtualDOM && typeof virtualDOM.type === "function";
}
```

## 4.src/TReact/mountComponent.js

```
import isFunction from "./isFunction";
import isFunctionComponent from "./isFunctionComponent";
import mountNativeElement from "./mountNativeElement";

export default function mountComponent(virtualDOM, container) {
  let nextVirtualDOM = null;

  // 判断组件是类组件还是函数组件
  if (isFunctionComponent(virtualDOM)) {
    // 函数组件
    nextVirtualDOM = buildFunctionComponent(virtualDOM);
  }

  if (isFunction(nextVirtualDOM)) {
    mountComponent(nextVirtualDOM, container);
  } else {
    mountNativeElement(nextVirtualDOM, container);
  }
}

function buildFunctionComponent(virtualDOM) {
  return virtualDOM.type(virtualDOM.props || {});
}

```

## 5.src/TReact/isFunctionComponent.js

```
import isFunction from "./isFunction";
export default function isFunctionComponent(virtualDOM) {
  const type = virtualDOM.type;
  return (
    type && isFunction(virtualDOM) && !(type.prototype && type.prototype.render)
  );
}

```

# 二、类组件的渲染

类组件本身也是 Virtual DOM，可以通过 Virtual DOM 中的 type 属性值确定当前要渲染的组件是类组件还是函数组件。

在确定当前要渲染的组件为类组件以后，需要实例化类组件得到类组件实例对象，通过类组件实例对象调用类组件中的 render 方法，获取组件要渲染的 Virtual DOM。

类组件需要继承 Component 父类，子类需要通过 super 方法将自身的 props 属性传递给 Component 父类，父类会将 props 属性挂载为父类属性，子类继承了父类，自己本身也就自然拥有 props 属性了。这样做的好处是当 props 发生更新后，父类可以根据更新后的 props 帮助子类更新视图。

## 1.src/index.js

```
import TReact from "./TReact";
const root = document.getElementById("root");

// 定义Alert类组件时，它是Component的子类，可以在内部中调用父类，把this.props传递给父类，让父类去执行this.props=props
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
```

## 2.src/TReact/Component.js——外部方法，需要导出

```
export default class Component {
  // 在子类中调用super其实就是调用这个父类的constructor
  constructor(props) {
    // 这样父类就有this.props属性了，子类继承父类，因此子类也有了this.props属性
    this.props = props;
  }
}
```

## 3.src/TReact/mountComponent.js

```
import isFunction from "./isFunction";
import isFunctionComponent from "./isFunctionComponent";
import mountNativeElement from "./mountNativeElement";

export default function mountComponent(virtualDOM, container) {
  let nextVirtualDOM = null;

  // 判断组件是类组件还是函数组件
  if (isFunctionComponent(virtualDOM)) {
    // 函数组件
    nextVirtualDOM = buildFunctionComponent(virtualDOM);
  } else {
    // 类组件
    nextVirtualDOM = buildClassComponent(virtualDOM);
  }

  if (isFunction(nextVirtualDOM)) {
    // 函数组件返回的virtualDOM还是一个函数组件
    mountComponent(nextVirtualDOM, container);
  } else {
    // 函数组件返回的virtualDOM是一个基本元素（有可能是下面两种情况
    // <div> 基本元素 </div>
    // <div> 包含了函数组件 <Text /> </div>）
    mountNativeElement(nextVirtualDOM, container);
  }
}

...

function buildClassComponent(virtualDOM) {
  // 这里的参数virtualDOM.props，其实是传递给了类组件里的constructor
  const component = new virtualDOM.type(virtualDOM.props || {});
  // 通过实例对象去调用render函数
  const nextVirtualDom = component.render();
  return nextVirtualDom;
}

```
