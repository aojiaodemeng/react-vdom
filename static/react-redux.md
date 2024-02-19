# Redux
Redux=Reducer+Flux.

工作流：
- step1:页面行为产生一个action，通过dispatch方法发出（如果是异步请求，即延迟发出action，则需要用到中间件）
- step2:reducer接收到这个action，以及当前的state，返回一个新的state
- step3:view监听reducer里的数据变化，就会更新view

# React-redux
单纯的Redux只是一个状态机，是没有UI呈现的，react- redux作用是将Redux的状态机和React的UI呈现绑定在一起，当你dispatch action改变state的时候，会自动更新页面。

