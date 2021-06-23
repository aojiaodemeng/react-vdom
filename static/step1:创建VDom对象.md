# 一. babel 插件，转换 jsx

## 1.创建/编写.babelrc 文件，配置@babel/preset-react，将 pragma 默认项 React.createElement 转换成 TReact.createElement

[babel-preset-react](https://www.babeljs.cn/docs/babel-preset-react)

```react
{
    "presets": [
        "@babel/preset-env",
        [
            "@babel/preset-react",
            {
                "pragma": "TReact.createElement"
            }
        ]
    ]
}
```

## 2.创建/编写 TReact/createElement.js 文件

```
export default function createElement(type, props, ...children) {
  return {
    type,
    props,
    children,
  };
}

```

## 3. 创建/编写 src/index.js

```
import TReact from "./TReact";

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

console.log(virtualDOM);
```

## 总结：

此时可以看到浏览器终端输出：

<img src="./images/step1-1.jpg"/>

这是因为在执行到“console.log(virtualDOM);”这行代码时，由于 babel 的设置，每一个 jsx 元素都会去调用 TReact.createElement 方法，这个方法会返回一个 VDom 对象：

<img src="./images/step1-2.jpg"/>
