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
  TextField,
  MenuItem,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../config/config.js";
import { useNavigate } from "react-router-dom";

const StorageList = () => {
  const navigate = useNavigate();
  const [storages, setStorages] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    productId: "",
    quantity: 0,
    createDate: "",
    updateDate: "",
    users: "ADMIN",
  });

  useEffect(() => {
    fetchStorages();
    fetchProducts();
  }, []);

  const fetchStorages = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/storage/Listgetall`
      );
      setStorages(res.data);
    } catch (err) {
      toast.error("Lỗi khi lấy danh sách:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/product/Listgetall`
      );
      setProducts(res.data);
    } catch (err) {
      toast.error("Lỗi khi load sản phẩm:", err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/storage/delete/${deleteId}`);
      setStorages(storages.filter((s) => s.idImport !== deleteId));
      toast.success("Xóa thành công!");
    } catch (err) {
      toast.error("Lỗi khi xóa:", err);
    } finally {
      setOpenDelete(false);
      setDeleteId(null);
    }
  };

  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleOpenUpdate = async (storage) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/storage/${storage.idImport}/get`
      );
      const detail = res.data;

      setSelectedStorage(detail);
      setForm({
        productId: detail.productId || "",
        quantity: detail.quantity || 0,
        createDate: detail.createDate || "",
        updateDate: detail.updateDate || "",
        users: detail.users || "admin",
      });
      setOpen(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết:", err);
      toast.error("Không thể tải chi tiết kho hàng!");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStorage(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "quantity" ? Number(value) : value,
    });
  };

  const handleUpdate = async () => {
    if (!selectedStorage) return;

    const formData = new FormData();
    formData.append("idImport", selectedStorage.idImport);
    formData.append("users", form.users);
    formData.append("createDate", form.createDate);
    formData.append("updateDate", form.updateDate);
    formData.append("productId", form.productId);
    formData.append("quantity", form.quantity);

    try {
      await axios.put(
        `${API_BASE_URL}/api/v1/storage/update/${selectedStorage.idImport}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Cập nhật thành công!");
      handleClose();
      fetchStorages();
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
    }
  };

  return (
    <Box sx={{ p: 3, mt: 10 }}>
      <Typography variant="h5" gutterBottom>
        DANH SÁCH KHO HÀNG
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
       onClick={() => navigate("/add-storage")}
      >
        + THÊM NHẬP KHO
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>NGƯỜI NHẬP</TableCell>
              <TableCell>SẢN PHẨM</TableCell>
              <TableCell>SỐ LƯỢNG</TableCell>
              <TableCell>NGÀY NHẬP</TableCell>
              <TableCell>NGÀY XUẤT KHO</TableCell>
              <TableCell>THAO TÁC</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {storages.map((s) => (
              <TableRow key={s.idImport}>
                <TableCell>{s.idImport}</TableCell>
                <TableCell>{s.users}</TableCell>
                <TableCell>{s.product_name}</TableCell>
                <TableCell>{s.quantity}</TableCell>
                <TableCell>{s.createDate}</TableCell>
                <TableCell>{s.updateDate}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="info"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Chi tiết
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => handleOpenUpdate(s)}
                  >
                    Cập nhật
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleOpenDelete(s.idImport)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Cập Nhật Kho Hàng</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Sản phẩm"
            name="productId"
            value={form.productId}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled
          >
            {products.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Số lượng"
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Ngày nhập"
            name="createDate"
            type="date"
            value={form.createDate}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Ngày cập nhật"
            name="updateDate"
            type="date"
            value={form.updateDate}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Người nhập"
            name="users"
            value={form.users}
            disabled
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Đóng</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc muốn xóa bản ghi này?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Hủy</Button>
          <Button color="error" onClick={handleConfirmDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

export default StorageList;
