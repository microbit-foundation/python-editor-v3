// Types as instructed in https://github.com/webpack-contrib/worker-loader/blob/master/README.md#integrating-with-typescript
declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}
