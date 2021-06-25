# 一、实现简单文本节点的更新

## 1.src/index.js

```
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
    <span>这是一段被修改过的内容</span>
    <button onClick={() => alert("你好！！！！！")}>点击我</button>
    <h3>这个将会被删除</h3>
    2, 3
    <input type="text" value="13" />
  </div>
);

TReact.render(virtualDOM, root);

setTimeout(() => {
  TReact.render(modifyDOM, root);
}, 2000);
```

## 2.在 render 方法中，赋值 oldDOM

```
export default function render(
  virtualDOM,
  container,
  // oldDOM指向页面旧的dom对象，container就是指id为root的元素
  // 因为jsx元素必须又一个父级，所以可以通过.firstChild方法获取
  oldDOM = container.firstChild
) {
  diff(virtualDOM, container, oldDOM);
}
```

## 3.src/TReact/createDOMElement.js——创建 dom 元素时，添加\_virtualDOM 属性

```
export default function createDOMElement(virtualDOM) {
  let newElement = null;
  if (virtualDOM.type === "text") {
    // 文本节点
    newElement = document.createTextNode(virtualDOM.props.textContent);
  } else {
    // 元素节点
    newElement = document.createElement(virtualDOM.type);
    // 为元素添加属性
    updateNodeElement(newElement, virtualDOM);
  }

  // 创建dom元素时，添加_virtualDOM属性
+ newElement._virtualDOM = virtualDOM;

  // 递归创建子节点
  virtualDOM.children.forEach((child) => {
    mountElement(child, newElement);
  });

  return newElement;
}

```

## 4.src/TReact/diff.js——更新 diff 方法

```
import mountElement from "./mountElement";
import updateTextNode from "./updateTextNode";
export default function diff(virtualDOM, container, oldDOM) {
  const oldVirtualDOM = oldDOM && oldDOM._virtualDOM;
  // 判断oldDOM是否存在
  if (!oldDOM) {
    mountElement(virtualDOM, container);
  } else if (oldVirtualDOM && virtualDOM.type === oldVirtualDOM.type) {
    if (virtualDOM.type === "text") {
      // 更新内容
      updateTextNode(virtualDOM, oldVirtualDOM, oldDOM);
    } else {
      // 更新元素属性
    }
    virtualDOM.children.forEach((child, i) => {
      diff(child, oldDOM, oldDOM.childNodes[i]);
    });
  }
}

```
