# 一、DOM 更新——简单文本节点的更新

在进行 Virtual DOM 比对时，需要用到更新后的 Virtual DOM 和更新前的 Virtual DOM，更新后的 Virtual DOM 目前我们可以通过 render 方法进行传递，现在的问题是更新前的 Virtual DOM 要如何获取呢？

对于更新前的 Virtual DOM，对应的其实就是已经在页面中显示的真实 DOM 对象。既然是这样，那么我们在创建真实 DOM 对象时，就可以将 Virtual DOM 添加到真实 DOM 对象的属性中。在进行 Virtual DOM 对比之前，就可以通过真实 DOM 对象获取其对应的 Virtual DOM 对象了，其实就是通过 render 方法的第三个参数获取的，container.firstChild。

## diff 方法-Virtual DOM 比对

判断 oldVirtualDOM 是否存在， 如果存在则继续判断要对比的 Virtual DOM 类型是否相同，如果类型相同判断节点类型是否是文本，如果是文本节点对比，就调用 updateTextNode 方法（对比文本内容是否发生变化），如果是元素节点对比就调用 setAttributeForElement 方法（对比元素属性是否发生变化）,最上层元素对比完成以后还需要递归对比子元素。当对比的元素节点类型不同时，就不需要继续对比了，直接使用新的 Virtual DOM 创建 DOM 对象，用新的 DOM 对象直接替换旧的 DOM 对象，当前这种情况要将组件刨除，组件要被单独处理。删除节点发生在节点更新以后并且发生在同一个父节点下的所有子节点身上，在节点更新完成以后，如果旧节点对象的数量多于新 VirtualDOM 节点的数量，就说明有节点需要被删除。

updateTextNode 方法用于对比文本节点内容是否发生变化，如果发生变化则更新真实 DOM 对象中的内容，既然真实 DOM 对象发生了变化，还要将最新的 Virtual DOM 同步给真实 DOM 对象。

setAttributeForElement 方法用于设置/更新元素节点属性。思路是先分别获取更新后的和更新前的 Virtual DOM 中的 props 属性，循环新 Virtual DOM 中的 props 属性，通过对比看一下新 Virtual DOM 中的属性值是否发生了变化，如果发生变化 需要将变化的值更新到真实 DOM 对象中。再循环未更新前的 Virtual DOM 对象，通过对比看看新的 Virtual DOM 中是否有被删除的属性，如果存在删除的属性 需要将 DOM 对象中对应的属性也删除掉。

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
  // 因为jsx元素必须有一个父级，所以可以通过.firstChild方法获取
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

# 二、DOM 更新——节点类型不相同

```
export default function diff(virtualDOM, container, oldDOM) {
  const oldVirtualDOM = oldDOM && oldDOM._virtualDOM;
  // 判断oldDOM是否存在
  if (!oldDOM) {...} else if (oldVirtualDOM && virtualDOM.type === oldVirtualDOM.type){...} else if(
    virtualDOM.type !== oldVirtualDOM.type &&
    typeof virtualDOM.type !== "function"
  ) {
    const newElement = createDOMElement(virtualDOM);
    oldDOM.parentNode.replaceChild(newElement, oldDOM);
  }
}
```

# 三、DOM 更新——删除属性，或其他属性的更新

```
export default function diff(virtualDOM, container, oldDOM) {
  const oldVirtualDOM = oldDOM && oldDOM._virtualDOM;
  // 判断oldDOM是否存在
  if (!oldDOM) {
    mountElement(virtualDOM, container);
  } else if (
    virtualDOM.type !== oldVirtualDOM.type &&
    typeof virtualDOM.type !== "function"
  ) {
    const newElement = createDOMElement(virtualDOM);
    oldDOM.parentNode.replaceChild(newElement, oldDOM);
  } else if (oldVirtualDOM && virtualDOM.type === oldVirtualDOM.type) {
    if (virtualDOM.type === "text") {
      // 更新内容
      updateTextNode(virtualDOM, oldVirtualDOM, oldDOM);
    } else {
      // 更新元素属性
+     updateNodeElement(oldDOM, virtualDOM, oldVirtualDOM);
    }
    virtualDOM.children.forEach((child, i) => {
      diff(child, oldDOM, oldDOM.childNodes[i]);
    });
  }
}
```

```
export default function updateNodeElement(
  newElement,
  virtualDOM,
  oldVirtualDOM = {}
) {
  // 获取节点对应的属性对象
  const newProps = virtualDOM.props || {};
  const oldProps = oldVirtualDOM.props || {};

  Object.keys(newProps).forEach((propName) => {
    // 获取属性值
    const newPropsValue = newProps[propName];
    const oldPropsValue = oldProps[propName];
    if (newPropsValue !== oldPropsValue) {
      // 判断属性是否是事件属性 onClick => click
      if (propName.slice(0, 2) === "on") {
        // 事件名称
        const eventName = propName.toLocaleLowerCase().slice(2);
        // 为元素添加事件
        newElement.addEventListener(eventName, newPropsValue);
        if (oldPropsValue) {
          newElement.removeEventListener(eventName, oldPropsValue);
        }
      } else if (propName === "value" || propName === "checked") {
        newElement[propName] = newPropsValue;
      } else if (propName !== "children") {
        if (propName === "className") {
          newElement.setAttribute("class", newPropsValue);
        } else {
          newElement.setAttribute(propName, newPropsValue);
        }
      }
    }
  });

  // 判断属性被删除的情况
  Object.keys(oldProps).forEach((propName) => {
    const newPropsValue = newProps[propName];
    const oldPropsValue = oldProps[propName];
    if (!newPropsValue) {
      // 属性被删除了
      if (propName.slice(0, 2) === "on") {
        const eventName = propName.toLowerCase().slice(2);
        newElement.removeEventListener(eventName, oldPropsValue);
      } else if (propName !== "children") {
        newElement.removeAttribute(propName);
      }
    }
  });
}

```

# 三、DOM 更新——删除节点

删除节点发生在节点更新以后并且发生在同一个父节点下的所有子节点身上。

在节点更新完成以后，如果旧节点对象的数量多于新 virtualDOM 节点的数量，就说明有节点需要被删除

## 1.更新 diff 方法

由于删除节点发生在同一个父节点下的所有子节点身上，因此是更新节点类型相同的情况下（virtualDOM.type === oldVirtualDOM.type）

```
export default function diff(virtualDOM, container, oldDOM) {
  const oldVirtualDOM = oldDOM && oldDOM._virtualDOM;
  // 判断oldDOM是否存在
  if (!oldDOM) {
    mountElement(virtualDOM, container);
  } else if (
    virtualDOM.type !== oldVirtualDOM.type &&
    typeof virtualDOM.type !== "function"
  ) {...} else if (oldVirtualDOM && virtualDOM.type === oldVirtualDOM.type) {
    ...

    // 删除节点
    // 获取旧节点
    let oldChildNodes = oldDOM.childNodes;
    if (oldChildNodes.length > virtualDOM.children.length) {
      // 有节点需要被删除
      for (
        let i = oldChildNodes.length - 1;
        i > virtualDOM.children.length;
        i--
      ) {
        unmountNode(oldChildNodes[i]);
      }
    }
  }
}

```

## 2.新建 src/TReact/unmountNode.js

```
export default function unmountNode(node) {
  node.remove();
}

```
