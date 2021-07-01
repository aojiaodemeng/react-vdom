# 一、key 属性的存在必要性

在 React 中，渲染列表数据时通常会在被渲染的列表元素上添加 key 属性，key 属性就是数据的唯一标识，帮助 React 识别哪些数据被修改或删除了，从而达到 DOM 最小化操作的目的。

key 属性不需要全局唯一，但是在同一个父节点下的兄弟节点之间必须是唯一的。即，在比对同一个父节点下类型相同的子节点时需要用到 key 属性。

# 二、实现思路

在两个元素进行比对时，如果类型相同，就循环旧的 DOM 对象的子元素，查看其身上是否有 key 属性，如果有就将这个子元素的 DOM 对象存储在一个 js 对象中，接着循环要渲染的 Virtual DOM 对象的子元素，在循环过程中获取到这个子元素的 key 属性，然后使用这个 key 属性到 js 对象中查找 DOM 对象，如果能找到就说明这个元素是已经存在的，是不需要重新渲染的，如果通过 key 属性找不到这个元素，就说明这个元素是新增的是需要渲染的，就调用 mountElement 方法把新增元素追加到页面中。

# 三、具体步骤

## 1.jsx

```javascript
// src/index.js
class KeyDemo extends TReact.Component {
  constructor(props) {
    super(props);
    this.state = {
      persons: [
        { id: 1, name: "name1" },
        { id: 2, name: "name2" },
        { id: 3, name: "name3" },
        { id: 4, name: "name4" },
      ],
    };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    const newState = JSON.parse(JSON.stringify(this.state));
    // 此行代码调试key能找到（元素调换了位置）的情况
    // newState.persons.push(newState.persons.shift());
    // 此行代码调试key不能找到（新增了元素）的情况
    newState.persons.splice(1, 0, { id: 100, name: "name new" });
    this.setState(newState);
  }
  render() {
    return (
      <div>
        <ul>
          {this.state.persons.map((person) => (
            <li key={person.id}>{person.name}</li>
          ))}
        </ul>
        <button onClick={this.handleClick}>按钮</button>
      </div>
    );
  }
}
TReact.render(<KeyDemo />, root);
```

## 2.diff

```javascript
// diff.js
else if (oldVirtualDOM && virtualDOM.type === oldVirtualDOM.type) {
  ...
  // 将拥有key属性的元素放入 keyedElements 对象中
  let keyedElements = {}
  for (let i = 0, len = oldDOM.childNodes.length; i < len; i++) {
    let domElement = oldDOM.childNodes[i]
    if (domElement.nodeType === 1) {
      let key = domElement.getAttribute("key")
      if (key) {
        keyedElements[key] = domElement
      }
    }
  }
  let hasNoKey = Object.keys(keyedElements).length === 0

  // 如果没有找到拥有 key 属性的元素 就按照索引进行比较
  if (hasNoKey) {
    // 递归对比 Virtual DOM 的子元素
    virtualDOM.children.forEach((child, i) => {
      diff(child, oldDOM, oldDOM.childNodes[i])
    })
  } else {
    // 使用key属性进行元素比较
    virtualDOM.children.forEach((child, i) => {
      // 获取要进行比对的元素的 key 属性
      let key = child.props.key
      // 如果 key 属性存在
      if (key) {
        // 到已存在的 DOM 元素对象中查找对应的 DOM 元素
        let domElement = keyedElements[key]
        // 如果找到元素就说明该元素已经存在 不需要重新渲染
        if (domElement) {
          // 虽然 DOM 元素不需要重新渲染 但是不能确定元素的位置就一定没有发生变化
          // 所以还要查看一下元素的位置
          // 看一下 oldDOM 对应的(i)子元素和 domElement 是否是同一个元素 如果不是就说明元素位置发生了变化
          if (oldDOM.childNodes[i] && oldDOM.childNodes[i] !== domElement) {
            // 元素位置发生了变化
            // 将 domElement 插入到当前元素位置的前面 oldDOM.childNodes[i] 就是当前位置
            // domElement 就被放入了当前位置
            oldDOM.insertBefore(domElement, oldDOM.childNodes[i])
          }
        } else {
          // 第一个参数：新增元素
          // 第二个参数：父级
          // 第三个参数：要插入的地方的兄弟节点
          mountElement(child, oldDOM, oldDOM.childNodes[i])
        }
      }
    })
  }
}

```

## 3.新增元素的情况处理

```javascript
export default function mountNativeElement(virtualDOM, container, oldDOM) {
  const newElement = createDOMElement(virtualDOM);

  if (oldDOM) {
    container.insertBefore(newElement, oldDOM);
  } else {
    // 将转换之后的DOM对象放置在页面中
    container.appendChild(newElement);
  }
  // 判断旧的dom对象是否存在，如果存在删除
  if (oldDOM) {
    unmountNode(oldDOM);
  }
  // 要调用component类中的setDOM方法，需要获取到组件的实例对象
  let component = virtualDOM.component;
  if (component) {
    component.setDOM(newElement);
  }
}
```
