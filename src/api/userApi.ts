import axios from "@/api/axios";

const register = (username: string, password: string) => {
  return axios.post("/api/register", { username, password });
};

const login = (username: string, password: string) => {
  return axios.post("/api/login", { username, password });
};

/**
 * 佣金信息
 */
const getBrokerageInfo = () => {
  return axios.get("/api/bill/brokerage");
};
/**
 * 结算记录
 */
const getBillPage = (currentPageNumber: number) => {
  return axios.get(`/api/bill/page/${currentPageNumber}`);
};
/**
 * 下级列表
 */
const getSubordinates = (currentPageNumber: number) => {
  return axios.get(`/api/user/subordinates/${currentPageNumber}`);
};
/**
 * 结算
 */
const settle = () => {
  return axios.post("/api/bill/settle");
};

/**
 * 注册成为下级
 */
const subordinateRegister = (address: string, parentAddress: string) => {
  return axios.post("/api/subordinate-register", { address, parentAddress });
};

const getAirdrops = (current: number, size: number) => {
  return axios.post(`/api/airdrop/list/`, { current, size });
};

export default {
  register,
  login,
  getBrokerageInfo,
  getBillPage,
  getSubordinates,
  settle,
  subordinateRegister,
  getAirdrops,
};
