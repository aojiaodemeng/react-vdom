import createDOMElement from "./createDOMElement";

export default function mountNativeElement(virtualDOM, container) {
  const newElement = createDOMElement(virtualDOM);
  // 将转换之后的DOM对象放置在页面中
  container.appendChild(newElement);
  // 要调用component类中的setDOM方法，需要获取到组件的实例对象
  let component = virtualDOM.component;
  if (component) {
    component.setDOM(newElement);
  }
}
