import axios from "@/api/axios";
import type { CallbackNotify } from "@/type/TronType";

export const register = (callback: CallbackNotify) => {
  return axios.post("/api/transfer/listen/register", callback);
};
