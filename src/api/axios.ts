import axios from "axios";
import { ElMessage } from "element-plus";

axios.defaults.timeout = 5000;

axios.interceptors.request.use(
  (config) => {
    config.headers = {
      "Content-Type": "application/json;charset=UTF-8",
    };

    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (res) => {
    if (typeof res.data !== "object") {
      ElMessage.error("返回数据不是对象！");
      return Promise.reject(res);
    }
    if (res.data.status !== true) {
      ElMessage.error(res.data.message);
      return Promise.reject(res);
    }

    return res.data;
  },
  (error) => {
    let defaultErrorMessage = "网络异常";
    if (error.response.data.message) {
      defaultErrorMessage = error.response.data.message;
    }
    ElMessage.error(defaultErrorMessage);
    Promise.reject(error);
  }
);

export default axios;
