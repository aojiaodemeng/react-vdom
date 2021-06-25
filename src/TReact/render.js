import diff from "./diff";
export default function render(
  virtualDOM,
  container,
  // oldDOM指向页面旧的dom对象，container就是指id为root的元素
  // 因为jsx元素必须又一个父级，所以可以通过.firstChild方法获取
  oldDOM = container.firstChild
) {
  diff(virtualDOM, container, oldDOM);
}
