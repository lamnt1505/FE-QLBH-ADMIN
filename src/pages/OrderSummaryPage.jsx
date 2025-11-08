import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  TablePagination,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../config/config.js";

const OrderSummaryPage = () => {
  const [orders, setOrders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [orderDetails, setOrderDetails] = useState([]);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [addressInfo, setAddressInfo] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      console.log("Kiểm tra và cập nhật trạng thái đơn hàng tự động");
      try {
        const res = await axios.get(
          `${API_BASE_URL}/dossier-statistic/summary`
        );
        const currentOrders = res.data;

        currentOrders.forEach(async (order) => {
          if (order.status === "Hoàn thành" || order.status === "Đã huỷ") {
            console.log(`=> Bỏ qua đơn #${order.orderId} (${order.status})`);
            return;
          }
          let nextStatus = "";
          switch (order.status) {
            case "Chờ duyệt":
              nextStatus = "Đang xử lý";
              break;
            case "Đang xử lý":
              nextStatus = "Đang giao hàng";
              break;
            case "Đang giao hàng":
              nextStatus = "Hoàn thành";
              break;
            default:
              nextStatus = order.status;
          }
          if (nextStatus === order.status) return;
          try {
            const updateRes = await axios.post(
              `${API_BASE_URL}/dossier-statistic/--update-status`,
              null,
              { params: { orderid: order.orderId, status: nextStatus } }
            );

            const result = updateRes.data;

            if (result === "SUCCESS") {
              toast.info(
                `🔄 Đơn hàng #${order.orderId} tự động chuyển sang "${nextStatus}"`,
                { position: "bottom-right", autoClose: 2500 }
              );
              console.log(`✅ Auto cập nhật: ${order.orderId} → ${nextStatus}`);
            } else if (result === "INSUFFICIENT_QUANTITY") {
              toast.warning(
                `⚠️ Đơn #${order.orderId} không đủ hàng, không thể tự cập nhật!`,
                { position: "bottom-right", autoClose: 3000 }
              );
            } else if (result === "STORAGE_NOT_FOUND") {
              toast.error(
                `❌ Đơn #${order.orderId}: sản phẩm không tồn tại trong kho!`,
                { position: "bottom-right", autoClose: 3000 }
              );
            } else {
              console.warn(`⚠️ Auto update thất bại cho đơn #${order.orderId}`);
            }
          } catch (err) {
            console.error("⚠️ Lỗi auto cập nhật trạng thái:", err);
          }
        });
      } catch (err) {
        console.error("🚨 Lỗi khi fetch danh sách đơn hàng:", err);
      }
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setStatus("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
    setStatus("");
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !status) {
      alert("Vui lòng chọn trạng thái!");
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE_URL}/dossier-statistic/--update-status`,
        null,
        {
          params: {
            orderid: selectedOrder.orderId,
            status: status,
          },
        }
      );

      const result = res.data;
      if (result === "SUCCESS") {
        toast.success("Cập nhật trạng thái thành công!");
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.orderId === selectedOrder.orderId ? { ...o, status: status } : o
          )
        );
        handleCloseDialog();
        fetchOrders();
        window.location.reload();
      } else if (result === "ORDERID_NOT_FOUND") {
        toast.warning("Không tìm thấy mã đơn hàng!");
      } else if (result === "STORAGE_NOT_FOUND") {
        toast.warning("Sản phẩm trong kho không tồn tại!");
      } else if (result === "INSUFFICIENT_QUANTITY") {
        toast.warning("Sản phẩm trong kho không đủ số lượng!");
      } else {
        toast.warning("Có lỗi xảy ra khi cập nhật trạng thái!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/dossier-statistic/summary`
      );
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", err);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
      setOrderDetails(res.data.oldOrders || []);
      setOpenDetailDialog(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      alert("Không thể lấy chi tiết đơn hàng!");
    }
  };

  const handleViewAddress = async (orderId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/orders/address/${orderId}`
      );
      if (!res.ok) throw new Error("Lỗi khi lấy địa chỉ");
      const data = await res.json();
      setAddressInfo(data);
      setOpenAddressDialog(true);
    } catch (error) {
      console.error(error);
    }
  };

  const paginatedOrders = orders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box
      sx={{
        width: "100%",
        px: 6,
        py: 4,
        backgroundColor: "#f9fafc",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#1976d2",
          mb: 3,
          textTransform: "uppercase",
        }}
      >
        Quản lý đơn hàng
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead
            sx={{
              background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
            }}
          >
            <TableRow>
              {[
                "MÃ ĐƠN HÀNG",
                "NGÀY ĐẶT HÀNG",
                "KHÁCH HÀNG",
                "SỐ ĐIỆN THOẠI",
                "TỔNG TIỀN",
                "PHƯƠNG THỨC THANH TOÁN",
                "TRẠNG THÁI",
                "THAO TÁC",
              ].map((header, i) => (
                <TableCell
                  key={i}
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    textAlign: "center",
                    fontSize: "0.95rem",
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f1f7ff",
                      transition: "0.2s",
                    },
                  }}
                >
                  <TableCell align="center">
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => handleViewDetails(order.orderId)}
                      sx={{ fontWeight: 600 }}
                    >
                      #{order.orderId}
                    </Button>
                  </TableCell>
                  <TableCell align="center">
                    {order.orderDate.join("-")}
                  </TableCell>
                  <TableCell align="center">{order.customerName}</TableCell>
                  <TableCell align="center">{order.phoneNumber}</TableCell>
                  <TableCell align="center">
                    {order.totalAmount.toLocaleString()} ₫
                  </TableCell>
                  <TableCell align="center">{order.paymentMethod}</TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "20px",
                        display: "inline-block",
                        backgroundColor:
                          order.status === "Hoàn thành"
                            ? "#c8e6c9"
                            : order.status === "Đã huỷ"
                            ? "#ffcdd2"
                            : order.status === "Đang giao hàng"
                            ? "#fff9c4"
                            : "#e3f2fd",
                        color:
                          order.status === "Hoàn thành"
                            ? "#2e7d32"
                            : order.status === "Đã huỷ"
                            ? "#c62828"
                            : order.status === "Đang giao hàng"
                            ? "#f57f17"
                            : "#1976d2",
                        fontWeight: 600,
                      }}
                    >
                      {order.status || "Chờ duyệt"}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDialog(order)}
                        sx={{
                          textTransform: "none",
                          borderRadius: "20px",
                          px: 2,
                        }}
                      >
                        Duyệt
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={() => handleViewAddress(order.orderId)}
                        sx={{
                          textTransform: "none",
                          borderRadius: "20px",
                          px: 2,
                        }}
                      >
                        Xem địa chỉ
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Không có đơn hàng nào.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={orders.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          rowsPerPageOptions={[5, 10, 20, 50]}
        />
      </TableContainer>

      {}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Chọn trạng thái đơn hàng
        </DialogTitle>
        <DialogContent>
          <RadioGroup
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {[
              "Chờ duyệt",
              "Đang xử lý",
              "Đang giao hàng",
              "Hoàn thành",
              "Đã huỷ",
            ].map((label, i) => (
              <FormControlLabel
                key={i}
                value={label}
                control={<Radio color="primary" />}
                label={label}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            color="primary"
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chi tiết */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Chi tiết đơn hàng
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID Sản phẩm</TableCell>
                  <TableCell>Tên sản phẩm</TableCell>
                  <TableCell>Giá</TableCell>
                  <TableCell>Số lượng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderDetails.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productId}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.price.toLocaleString()} ₫</TableCell>
                    <TableCell>{item.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog địa chỉ */}
      <Dialog
        open={openAddressDialog}
        onClose={() => setOpenAddressDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Thông tin giao hàng
        </DialogTitle>
        <DialogContent dividers>
          {addressInfo ? (
            <>
              <Typography>
                <strong>Tên người nhận:</strong> {addressInfo.receiverName}
              </Typography>
              <Typography>
                <strong>Họ và tên:</strong> {addressInfo.username || "Không có"}
              </Typography>
              <Typography>
                <strong>SĐT:</strong> {addressInfo.receiverPhone}
              </Typography>
              <Typography>
                <strong>Địa chỉ:</strong> {addressInfo.shippingAddress}
              </Typography>
              <Typography>
                <strong>Ghi chú:</strong> {addressInfo.note || "Không có"}
              </Typography>
            </>
          ) : (
            <Typography>Đang tải dữ liệu...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddressDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

export default OrderSummaryPage;
