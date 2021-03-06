import isFunction from "./isFunction";
import isFunctionComponent from "./isFunctionComponent";
import mountNativeElement from "./mountNativeElement";

export default function mountComponent(virtualDOM, container, oldDOM) {
  let nextVirtualDOM = null;
  let component = null;
  // 判断组件是类组件还是函数组件
  if (isFunctionComponent(virtualDOM)) {
    // 函数组件
    nextVirtualDOM = buildFunctionComponent(virtualDOM);
  } else {
    // 类组件
    nextVirtualDOM = buildClassComponent(virtualDOM);
    component = nextVirtualDOM.component;
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

  if (component) {
    if (component.props && component.props.ref) {
      component.props.ref(component);
    }
  }
}

function buildFunctionComponent(virtualDOM) {
  // 这是函数组件，即virtualDOM.type是一个函数，将函数组件的props值传入
  // 并且会返回一个新的virtualDOM，这个新的virtualDOM可能还是一个函数组件，也有可能是基本元素
  return virtualDOM.type(virtualDOM.props || {});
}

// 处理类组件
function buildClassComponent(virtualDOM) {
  // 这里的参数virtualDOM.props，其实是传递给了类组件里的constructor
  const component = new virtualDOM.type(virtualDOM.props || {});
  // 通过实例对象去调用render函数
  const nextVirtualDom = component.render();
  // 用component属性保存组件的实例对象
  nextVirtualDom.component = component;
  return nextVirtualDom;
}
