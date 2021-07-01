import createDOMElement from "./createDOMElement";
import unmountNode from "./unmountNode";
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
