
import axios from "axios";
import API_BASE_URL from "../config/config.js";
const API_URL = `${API_BASE_URL}/api/v1/account`;

export const changePassword = async (accountId, oldPassword, newPassword, confirmPassword) => {
  const apiUrl = `${API_URL}/changer-password/${accountId}?oldPassword=${encodeURIComponent(
    oldPassword
  )}&newPassword=${encodeURIComponent(newPassword)}&confirmPassword=${encodeURIComponent(confirmPassword)}`;

  try {
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", 
    });

    const text = await response.text();

    if (response.ok) {
      return { success: true, message: text || "Đổi mật khẩu thành công" };
    } else {
      return { success: false, message: text || "Đổi mật khẩu thất bại" };
    }
  } catch (error) {
    console.error("❌ Lỗi khi đổi mật khẩu:", error);
    return { success: false, message: "Lỗi kết nối đến máy chủ" };
  }
};
export const getAccountById = async (accountId) => {
  const res = await axios.get(`${API_URL}/${accountId}/get`);
  return res.data;
};
export const updateAccount = async (accountId, accountDTO) => {
  const res = await axios.put(`${API_URL}/update/${accountId}`, accountDTO, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};