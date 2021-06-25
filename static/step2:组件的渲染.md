# 一、函数组件的渲染

### 1.src/index.js

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

### 2.src/TReact/mountElement.js

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

### 3.src/TReact/isFunction.js

```
export default function isFunction(virtualDOM) {
  return virtualDOM && typeof virtualDOM.type === "function";
}
```

### 4.src/TReact/mountComponent.js

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

### 5.src/TReact/isFunctionComponent.js

```
import isFunction from "./isFunction";
export default function isFunctionComponent(virtualDOM) {
  const type = virtualDOM.type;
  return (
    type && isFunction(virtualDOM) && !(type.prototype && type.prototype.render)
  );
}

```
