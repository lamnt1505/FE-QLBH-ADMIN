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
  Chip,
  TablePagination,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const DiscountList = () => {
  const [discounts, setDiscounts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    discountName: "",
    discountCode: "",
    discountPercent: "",
    dateStart: "",
    dateFinish: "",
    productID: "",
    active: false,
  });

  const handleOpenConfirm = (id) => {
    console.log("ID được chọn:", id);//đã có id truyền vào
    setSelectedId(id);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setSelectedId(null);
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleOpenUpdate = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/v1/discounts/${id}/get`
      );
      if (res.data.success) {
        const data = res.data.data;
        setSelectedDiscount(data);
        setFormData({
          discountName: data.discountName || "",
          discountCode: data.discountCode || "",
          discountPercent: data.discountPercent || "",
          dateStart: data.dateStart || "",
          dateFinish: data.dateFinish || "",
          productID: data.productID || "",
          active: data.active || false,
        });
        setOpenUpdate(true);
      } else {
        toast.error("Không thể tải chi tiết mã giảm giá!");
      }
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết:", err);
      toast.error("Lỗi khi tải chi tiết mã giảm giá!");
    }
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
    setSelectedDiscount(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmitUpdate = async () => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/v1/discounts/${selectedDiscount.discountID}`,
        formData
      );
      if (res.data.success) {
        toast.success("Cập nhật thành công!");
        handleCloseUpdate();
        fetchDiscounts();
      } else {
        toast.error(res.data.message || "Cập nhật thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      toast.error("Không thể cập nhật mã giảm giá!");
    }
  };

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/v1/discounts/list"
      );
      setDiscounts(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách mã giảm giá:", err);
      toast.error("Không thể tải danh sách mã giảm giá!");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedDiscounts = discounts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatus = (start, finish) => {
    const today = new Date();
    const startDate = new Date(start);
    const endDate = new Date(finish);
    if (today < startDate) return "Chưa bắt đầu";
    if (today > endDate) return "Hết hạn";
    return "Còn hạn";
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/v1/discounts/${id}/toggle`
      );
      toast.success(res.data.message);
      fetchDiscounts();
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái:", err);
      toast.error("Không thể thay đổi trạng thái!");
    }
  };

  const handleDeleteDiscount = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:8080/api/v1/discounts/${selectedId}`
      );

      if (res.data.success) {
        toast.success(res.data.message || "Xóa mã giảm giá thành công!");
        fetchDiscounts();
      } else {
        toast.error(res.data.message || "Xóa thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi xóa mã giảm giá:", err);
      toast.error("Đã xảy ra lỗi khi xóa mã giảm giá!");
    } finally {
      handleCloseConfirm();
    }
  };

  return (
    <>
      {selectedDiscount && (
        <Dialog
          open={openUpdate}
          onClose={handleCloseUpdate}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: "bold", color: "#1976d2" }}>
            Cập nhật mã giảm giá
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <TextField
                label="Tên mã giảm giá"
                name="discountName"
                value={formData.discountName}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                label="Mã code"
                name="discountCode"
                value={formData.discountCode}
                onChange={handleInputChange}
                fullWidth
                disabled
              />
              <TextField
                label="Phần trăm giảm (%)"
                name="discountPercent"
                type="number"
                value={formData.discountPercent}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                label="Ngày bắt đầu"
                name="dateStart"
                type="date"
                value={formData.dateStart}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Ngày kết thúc"
                name="dateFinish"
                type="date"
                value={formData.dateFinish}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.active}
                    onChange={handleInputChange}
                    name="active"
                  />
                }
                label="Đang kích hoạt"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUpdate} color="inherit">
              Hủy
            </Button>
            <Button
              onClick={handleSubmitUpdate}
              variant="contained"
              color="primary"
            >
              Lưu thay đổi
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Box sx={{ p: 3, mt: 10 }}>
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
          DANH SÁCH MÃ GIẢM GIÁ
        </Typography>
        <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/add-discounts")}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}
          >
            THÊM MỚI MÃ GIẢM GIÁ
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#1976d2" }}>
              <TableRow>
                {[
                  "ID",
                  "TÊN MÃ GIẢM GIÁ",
                  "MÃ CODE",
                  "PHẦN TRĂM GIẢM",
                  "NGÀY BẮT ĐẦU",
                  "NGÀY KẾT THÚC",
                  "SẢN PHẨM ÁP DỤNG",
                  "TRẠNG THÁI",
                  "CHỨC NĂNG",
                  "KÍCH HOẠT",
                  "HÀNH ĐỘNG",
                ].map((header, i) => (
                  <TableCell
                    key={i}
                    sx={{
                      color: "white",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDiscounts.length > 0 ? (
                paginatedDiscounts.map((d, index) => {
                  const status = getStatus(d.dateStart, d.dateFinish);
                  return (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": { backgroundColor: "#f9f9f9" },
                        textAlign: "center",
                      }}
                    >
                      <TableCell align="center">{d.discountID}</TableCell>
                      <TableCell align="center">{d.discountName}</TableCell>
                      <TableCell align="center">
                        <b style={{ color: "#1976d2" }}>{d.discountCode}</b>
                      </TableCell>
                      <TableCell align="center">{d.discountPercent}%</TableCell>
                      <TableCell align="center">{d.dateStart}</TableCell>
                      <TableCell align="center">{d.dateFinish}</TableCell>
                      <TableCell align="center">
                        {d.productID || "Tất cả"}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={status}
                          color={
                            status === "Còn hạn"
                              ? "success"
                              : status === "Hết hạn"
                              ? "error"
                              : "warning"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => handleOpenUpdate(d.discountID)}
                            sx={{ textTransform: "none", borderRadius: 2 }}
                          >
                            Cập nhật
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleOpenConfirm(d.discountID)}
                            sx={{ textTransform: "none", borderRadius: 2 }}
                          >
                            Xóa
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={d.active ? "Đang bật" : "Tắt"}
                          color={d.active ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color={d.active ? "error" : "success"}
                          size="small"
                          onClick={() => handleToggleActive(d.discountID)}
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          {d.active ? "Vô hiệu hoá" : "Kích hoạt"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      Không có mã giảm giá nào.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={discounts.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
            rowsPerPageOptions={[5, 10, 20, 50]}
          />
        </TableContainer>
        <ToastContainer position="top-right" autoClose={3000} />
        <Dialog
  open={openConfirm}
  onClose={handleCloseConfirm}
  maxWidth="xs"
  fullWidth
>
  <DialogTitle sx={{ color: "#d32f2f", fontWeight: "bold" }}>
    Xác nhận xóa
  </DialogTitle>
  <DialogContent>
    <Typography>
      Bạn có chắc chắn muốn xóa mã giảm giá này không? <br />
      Hành động này không thể hoàn tác.
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseConfirm} color="inherit">
      Hủy
    </Button>
    <Button
      onClick={handleDeleteDiscount}
      color="error"
      variant="contained"
    >
      Xóa
    </Button>
  </DialogActions>
</Dialog>
      </Box>
    </>
  );
};

export default DiscountList;
