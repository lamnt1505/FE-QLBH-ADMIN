import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  TextField,
  Button,
  Badge,
} from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import useAuthCookie from "../hooks/useAuthCookie";
import { db } from "../firebase/firebaseConfig";
import {
  ref,
  onChildAdded,
  push,
  off,
  get,
  set,
  onValue,
} from "firebase/database";
import API_BASE_URL from "../config/config.js";
import {
  getAccountById,
  updateAccount,
  changePassword,
} from "../api/accountApi";
const drawerWidth = 240;

const Header = ({ drawerWidth }) => {
  const { accountName } = useAuthCookie();
  const [openChatList, setOpenChatList] = useState(false);
  const [openChatBox, setOpenChatBox] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatWithUser, setChatWithUser] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [readUsers, setReadUsers] = useState([]);
  const chatEndRef = useRef(null);

  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingChange, setLoadingChange] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const accountId = localStorage.getItem("accountId");

  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [accountInfo, setAccountInfo] = useState({
    accountName: "",
    username: "",
    phoneNumber: "",
    email: "",
    local: "",
    dateOfBirth: "",
    image: "",
  });
  const [previewImage, setPreviewImage] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatWithUser]);

  useEffect(() => {
    return () => {
      off(ref(db, "chat/conversations"));
    };
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/account/logout`, {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("account");
      localStorage.removeItem("accountId");
      localStorage.removeItem("accountName");
      localStorage.removeItem("auth");
      window.location.href = "/login";
    } catch (err) {
      console.error("Lỗi logout:", err);
    }
  };

  const handleOpenChangePassword = () => {
    setOpenChangePassword(true);
    setAnchorEl(null);
  };

  const handleChangePassword = async () => {
    setLoadingChange(true);
    setMessage("");

    const result = await changePassword(
      accountId,
      oldPassword,
      newPassword,
      confirmPassword
    );

    setIsSuccess(result.success);
    setMessage(result.message);

    if (result.success) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => setOpenChangePassword(false), 2000);
    }

    setLoadingChange(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setAccountInfo((prev) => ({
          ...prev,
          image: base64String,
        }));
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenEditProfile = async () => {
    setOpenEditProfile(true);
    setAnchorEl(null);
    const id = localStorage.getItem("accountId");
    try {
      const data = await getAccountById(id);
      setAccountInfo({
        accountName: data.accountName || "",
        username: data.username || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        local: data.local || "",
        dateOfBirth: data.dateOfBirth || "",
        image: data.image || "",
      });
      setPreviewImage(data.image || "");
    } catch (err) {
      console.error("Lỗi khi lấy thông tin tài khoản:", err);
    }
  };

  const handleUpdateProfile = async () => {
    setLoadingUpdate(true);
    const id = localStorage.getItem("accountId");

    try {
      await updateAccount(id, accountInfo);
      setMessage("CẬP NHẬT TÀI KHOẢN THÀNH CÔNG ✅");
      setIsSuccess(true);
      setTimeout(() => setOpenEditProfile(false), 1500);
    } catch (err) {
      console.error("Lỗi khi cập nhật tài khoản:", err);
      setMessage("CẬP NHẬT THẤT BẠI ❌");
      setIsSuccess(false);
    } finally {
      setLoadingUpdate(false);
    }
  };

  // ============ 💬 DANH SÁCH KH ============
  const handleOpenChatList = async () => {
    setOpenChatList(true);
    setLoading(true);
    try {
      const snapshot = await get(ref(db, "chat/conversations"));
      if (snapshot.exists()) {
        const data = snapshot.val();

        const users = Object.keys(data || {}).filter(
          (key) =>
            data[key] &&
            typeof data[key] === "object" &&
            Object.values(data[key])[0]?.sender
        );

        const latestMsgs = users.map((user) => {
          const msgs = Object.values(data[user]);
          const lastMsg = msgs[msgs.length - 1];
          return { sender: user, ...lastMsg };
        });

        setMessages(latestMsgs.reverse());
      }
    } catch (err) {
      console.error("Lỗi tải tin nhắn:", err);
    } finally {
      setLoading(false);
    }
    const chatRef = ref(db, "chat/conversations");
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      let newCount = 0;
      Object.keys(data).forEach((user) => {
        const msgs = Object.values(data[user]);
        const lastMsg = msgs[msgs.length - 1];
        if (
          lastMsg &&
          lastMsg.sender !== "Admin" &&
          !readUsers.includes(user)
        ) {
          newCount++;
        }
      });

      setNewMsgCount(newCount);
    });
  };
  // ============ 🧍‍♂️ CHỌN KH ĐỂ CHAT ============
  const handleSelectUser = async (senderName) => {
    setSelectedUser(senderName);
    setOpenChatBox(true);
    setOpenChatList(false);
    setReadUsers((prev) => [...new Set([...prev, senderName])]);

    const chatRef = ref(db, `chat/conversations/${senderName}`);
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data).sort(
          (a, b) => a.timestamp - b.timestamp
        );
        setChatWithUser(list);
      } else setChatWithUser([]);
    });
    setNewMsgCount((prev) => Math.max(prev - 1, 0));
  };
  // ============ 📨 GỬI TIN ADMIN ============
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedUser) return;
    try {
      const chatRef = ref(db, `chat/conversations/${selectedUser}`);
      const newMsg = push(chatRef);
      await set(newMsg, {
        sender: "Admin",
        content: replyText,
        timestamp: Date.now(),
      });
      setReplyText("");

      await fetch(
        `${API_BASE_URL}/api/chat/send?sender=Admin&content=(${selectedUser}) ${replyText}`,
        { method: "POST" }
      );
    } catch (err) {
      console.error("Lỗi khi gửi phản hồi:", err);
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: "#fff",
        color: "#000",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">DASH BOARD ADMIN</Typography>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <IconButton color="inherit" onClick={handleOpenChatList}>
            <Badge
              badgeContent={newMsgCount}
              color="error"
              overlap="circular"
              invisible={newMsgCount === 0}
            ></Badge>
            <MailIcon />
          </IconButton>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Avatar
              sx={{ width: 32, height: 32, cursor: "pointer" }}
              onClick={handleMenuOpen}
            >
              {accountName ? accountName.charAt(0).toUpperCase() : "?"}
            </Avatar>
            <Typography
              variant="body1"
              onClick={handleMenuOpen}
              style={{ cursor: "pointer" }}
            >
              {accountName}
            </Typography>
          </div>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleOpenEditProfile}>
              CHỈNH SỬA THÔNG TIN
            </MenuItem>
            <MenuItem onClick={handleOpenChangePassword}>ĐỔI MẬT KHẨU</MenuItem>
            <MenuItem onClick={handleLogout}>ĐĂNG XUẤT</MenuItem>
          </Menu>
        </div>
      </Toolbar>

      {/* 💬 DANH SÁCH KH */}
      <Dialog
        open={openChatList}
        onClose={() => setOpenChatList(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>
          Tin nhắn khách hàng
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {messages.map((msg) => (
                <ListItem
                  key={msg.sender}
                  button
                  onClick={() => handleSelectUser(msg.sender)}
                  sx={{
                    backgroundColor: readUsers.includes(msg.sender)
                      ? "#f5f5f5"
                      : "#e3f2fd",
                    mb: 1,
                    borderRadius: 2,
                    "&:hover": { backgroundColor: "#bbdefb" },
                  }}
                >
                  <ListItemText
                    primary={<b>{msg.sender}</b>}
                    secondary={msg.content}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
      {/* 🗨️ CỬA SỔ CHAT */}
      <Dialog
        open={openChatBox}
        onClose={() => setOpenChatBox(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>
          Chat với {selectedUser}
        </DialogTitle>
        <DialogContent>
          <Box
            className="admin-chat-body"
            sx={{
              maxHeight: 400,
              overflowY: "auto",
              mb: 2,
              pr: 1,
              pt: 1,
            }}
          >
            {chatWithUser.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  textAlign: msg.sender === "Admin" ? "right" : "left",
                  mb: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    display: "inline-block",
                    backgroundColor:
                      msg.sender === "Admin" ? "#bbdefb" : "#f1f1f1",
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    maxWidth: "75%",
                  }}
                >
                  <b>{msg.sender}:</b> {msg.content}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Nhập nội dung phản hồi..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
            />
            <Button variant="contained" onClick={handleSendReply}>
              Gửi
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openChangePassword}
        onClose={() => setOpenChangePassword(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            textAlign: "center",
            backgroundColor: "#1976d2",
            color: "#fff",
          }}
        >
          🔒 ĐỔI MẬT KHẨU
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Mật khẩu cũ"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Xác nhận mật khẩu mới"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              size="small"
            />

            {message && (
              <Typography
                variant="body2"
                sx={{
                  textAlign: "center",
                  color: isSuccess ? "green" : "error.main",
                  mt: 1,
                }}
              >
                {message}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={() => setOpenChangePassword(false)}
              >
                HỦY
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleChangePassword}
                disabled={loadingChange}
              >
                {loadingChange ? "ĐANG XỬ LÝ..." : "XÁC NHẬN"}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openEditProfile}
        onClose={() => setOpenEditProfile(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            textAlign: "center",
            backgroundColor: "#1976d2",
            color: "#fff",
          }}
        >
          ✏️ CHỈNH SỬA THÔNG TIN
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="TÊN ĐĂNG NHẬP"
              value={accountInfo.accountName}
              onChange={(e) =>
                setAccountInfo({ ...accountInfo, accountName: e.target.value })
              }
              disabled
              fullWidth
              size="small"
            />
            <TextField
              label="HỌ VÀ TÊN"
              value={accountInfo.username}
              onChange={(e) =>
                setAccountInfo({ ...accountInfo, username: e.target.value })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="EMAIL"
              value={accountInfo.email}
              onChange={(e) =>
                setAccountInfo({ ...accountInfo, email: e.target.value })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="SỐ ĐIỆN THOẠI"
              value={accountInfo.phoneNumber}
              onChange={(e) =>
                setAccountInfo({ ...accountInfo, phoneNumber: e.target.value })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="ĐỊA CHỈ"
              value={accountInfo.local}
              onChange={(e) =>
                setAccountInfo({ ...accountInfo, local: e.target.value })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="NGÀY SINH"
              type="date"
              value={accountInfo.dateOfBirth}
              onChange={(e) =>
                setAccountInfo({ ...accountInfo, dateOfBirth: e.target.value })
              }
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <Box sx={{ textAlign: "center" }}>
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  style={{ width: 100, height: 100, borderRadius: "50%" }}
                />
              )}
              <Button variant="contained" component="label" sx={{ mt: 1 }}>
                Chọn ảnh
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </Button>
            </Box>

            {message && (
              <Typography
                variant="body2"
                sx={{
                  textAlign: "center",
                  color: isSuccess ? "green" : "error.main",
                  mt: 1,
                }}
              >
                {message}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={() => setOpenEditProfile(false)}
              >
                HỦY
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateProfile}
                disabled={loadingUpdate}
              >
                {loadingUpdate ? "ĐANG XỬ LÝ..." : "LƯU THAY ĐỔI"}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </AppBar>
  );
};

export default Header;
