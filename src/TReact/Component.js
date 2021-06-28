import diff from "./diff";
export default class Component {
  // 在子类中调用super其实就是调用这个父类的constructor
  constructor(props) {
    // 这样父类就有this.props属性了，子类继承父类，因此子类也有了this.props属性
    this.props = props;
  }
  setState(state) {
    this.state = Object.assign({}, this.state, state);
    // 获取最新的要渲染的 virtualDOM 对象
    let virtualDOM = this.render();
    console.log(virtualDOM);
    // 获取旧的virtualDOM对象进行比对
    let oldDOM = this.getDOM();
    console.log(oldDOM);
    let container = oldDOM.parentNode;
    diff(virtualDOM, container, oldDOM);
  }
  setDOM(dom) {
    this._dom = dom;
  }
  getDOM() {
    return this._dom;
  }
}
