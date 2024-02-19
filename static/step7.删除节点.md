# 一、节点卸载——实现比对 key 后直接删除

在比对节点的过程中，如果旧节点的数量多于要渲染的新节点的数量就说明有节点被删除了，继续判断 keyedElements 对象中是否有原属性，如果没有就使用索引方式删除，如果有就要使用 key 属性比对的方式进行删除。

实现思路是循环旧节点，在循环旧节点的过程中获取旧节点对应的 key 属性，然后根据 key 属性在新节点中查找这个旧节点，如果找到就说明这个节点没有被删除，如果没有找到，就说明节点被删除了，调用卸载节点的方法卸载节点即可。

```javascript
// diff.js
// 删除节点
// 获取旧节点
let oldChildNodes = oldDOM.childNodes;
if (oldChildNodes.length > virtualDOM.children.length) {
  if (hasNoKey) {
    // 有节点需要被删除
    for (
      let i = oldChildNodes.length - 1;
      i > virtualDOM.children.length;
      i--
    ) {
      unmountNode(oldChildNodes[i]);
    }
  } else {
    // 通过key属性删除节点
    for (let i = 0; i < oldChildNodes.length; i++) {
      let oldChild = oldChildNodes[i];
      let oldChildKey = oldChild._virtualDOM.props.key;
      let found = false;
      for (let n = 0; n < virtualDOM.children.length; n++) {
        if (oldChildKey === virtualDOM.children[n].props.key) {
          found = true;
          break;
        }
      }
      if (!found) {
        unmountNode(oldChild);
      }
    }
  }
}
```

# 二、节点卸载——完善细节

卸载节点除了删除节点即可，还需要考虑以下情况：

1.删除的节点是文本节点，可以直接删除

2.删除的节点由组件生成，需要调用组件卸载生命周期函数

3.删除的节点中包含了其他组件生成的节点，需要调用其他组件的卸载生命周期函数

4.删除的节点身上有 ref 属性，还需要删除通过 ref 属性传递给组件的 DOM 节点对象

5.删除的节点身上有事件，需要删除事件对应的事件处理函数

```javascript
export default function unmountNode(node) {
  // 获取节点的_virtualDOM对象
  const virtualDOM = node._virtualDOM;
  // 1.文本节点可以直接删除
  if (virtualDOM.type === "text") {
    node.remove();
    return;
  }

  // 2.看一下节点是否是由组件生成的
  let component = virtualDOM.component;
  // 如果component存在就说明节点是由组件生成的
  if (component) {
    component.componentWillUnmount();
  }
  // 3.看一下节点身上是否有ref属性
  if (virtualDOM.props && virtualDOM.props.ref) {
    virtualDOM.props.ref(null);
  }

  // 4.看一下节点的属性中是否有事件属性
  Object.keys(virtualDOM.props).forEach((propName) => {
    if (propName.slice(0, 2) === "on") {
      const eventName = propName.toLowerCase().slice(0, 2);
      const eventHandler = virtualDOM.props[propName];
      node.removeEventListener(eventName, eventHandler);
    }
  });

  // 5.递归删除子节点
  if (node.childNodes.length > 0) {
    for (let i = 0; i < node.childNodes.length; i++) {
      unmountNode(node.childNodes[i]);
      i--;
    }
  }
  // 删除节点
  node.remove();
}
```
