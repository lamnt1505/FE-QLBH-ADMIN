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
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderSummaryPage = () => {
  const [orders, setOrders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [orderDetails, setOrderDetails] = useState([]);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  useEffect(() => {
    fetchOrders();
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
        "http://localhost:8080/dossier-statistic/--update-status",
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
        "http://localhost:8080/dossier-statistic/summary"
      );
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", err);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const res = await axios.get(`http://localhost:8080/orders/${orderId}`);
      setOrderDetails(res.data.oldOrders || []);
      setOpenDetailDialog(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      alert("Không thể lấy chi tiết đơn hàng!");
    }
  };

  return (
    <Box sx={{ width: "100%", p: 10 }}>
      <Typography variant="h5" gutterBottom>
        Quản lý đơn hàng
      </Typography>

      <TableContainer
        component={Paper}
        sx={{ boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>MÃ ĐƠN HÀNG</TableCell>
              <TableCell sx={{ color: "white" }}>NGÀY ĐẶT HÀNG</TableCell>
              <TableCell sx={{ color: "white" }}>KHÁCH HÀNG</TableCell>
              <TableCell sx={{ color: "white" }}>SỐ ĐIỆN THOẠI</TableCell>
              <TableCell sx={{ color: "white" }}>TỔNG TIỀN</TableCell>
              <TableCell sx={{ color: "white" }}>TRẠNG THÁI ĐƠN HÀNG</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Button
                    variant="text"
                    onClick={() => handleViewDetails(order.orderId)}
                  >
                    {order.orderId}
                  </Button>
                </TableCell>
                <TableCell>{order.orderDate.join("-")}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.phoneNumber}</TableCell>
                <TableCell>{order.totalAmount}</TableCell>
                <TableCell>
                  {order.status || "Chờ duyệt"}
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ ml: 9 }}
                    onClick={() => handleOpenDialog(order)}
                  >
                    Duyệt
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Chọn trạng thái đơn hàng</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <FormControlLabel
              value="Chờ duyệt"
              control={<Radio />}
              label="Chờ duyệt"
            />
            <FormControlLabel
              value="Đang xử lý"
              control={<Radio />}
              label="Đang xử lý"
            />
            <FormControlLabel
              value="Hoàn thành"
              control={<Radio />}
              label="Hoàn thành"
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
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
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>CHI TIẾT ĐƠN HÀNG</DialogTitle>
        <DialogContent>
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
                    <TableCell>{item.price}</TableCell>
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
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
  
};

export default OrderSummaryPage;
