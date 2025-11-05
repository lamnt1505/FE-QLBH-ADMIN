import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Products/addProduct.css";
import API_BASE_URL from "../config/config.js";

const CreateDiscountPage = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [formData, setFormData] = useState({
    discountName: "",
    discountPercent: "",
    dateStart: "",
    dateFinish: "",
  });

  const [errors, setErrors] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErr = {};
    if (!formData.discountName?.trim())
      newErr.discountName = "VUI LÒNG NHẬP TÊN CHƯƠNG TRÌNH";

    const percent = Number(formData.discountPercent);
    if (!formData.discountPercent)
      newErr.discountPercent = "VUI LÒNG NHẬP % GIẢM";
    else if (isNaN(percent) || percent < 1 || percent > 100)
      newErr.discountPercent = "PHẦN TRĂM GIẢM PHẢI TỪ 1 ĐẾN 100";

    if (!formData.dateStart) newErr.dateStart = "VUI LÒNG CHỌN NGÀY BẮT ĐẦU";
    if (!formData.dateFinish) newErr.dateFinish = "VUI LÒNG CHỌN NGÀY KẾT THÚC";

    if (formData.dateStart && formData.dateFinish) {
      const start = new Date(formData.dateStart);
      const finish = new Date(formData.dateFinish);
      if (finish < start)
        newErr.dateFinish = "NGÀY KẾT THÚC PHẢI ≥ NGÀY BẮT ĐẦU";
    }

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/discounts/generate`,
        {
          discountName: formData.discountName,
          discountPercent: formData.discountPercent,
          dateStart: formData.dateStart,
          dateFinish: formData.dateFinish,
        }
      );

      if (res.data?.discountCode !== undefined) {
        setDiscountCode(res.data.discountCode);
        setDialogOpen(true);
        toast.success("TẠO MÃ GIẢM GIÁ THÀNH CÔNG!");
      } else {
        toast.error("TẠO MÃ THẤT BẠI!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message ||"CÓ LỖI XẢY RA KHI GỌI API!");
    }
  };

  const handleClose = () => setDialogOpen(false);

  const handleReset = () => {
    setFormData({
      discountName: "",
      discountPercent: "",
      dateStart: "",
      dateFinish: "",
    });
    setErrors({});
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(discountCode);
      setSnackbarOpen(true);
    } catch {
      alert("Không thể copy, vui lòng copy thủ công.");
    }
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          pt: 12,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 560,
            p: 3,
            bgcolor: "#fff",
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" gutterBottom>
            TẠO MÃ GIẢM GIÁ MỚI
          </Typography>

          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              <TextField
                label="TÊN CHƯƠNG TRÌNH"
                name="discountName"
                value={formData.discountName}
                onChange={handleChange}
                error={!!errors.discountName}
                helperText={errors.discountName}
                fullWidth
                required
              />
              <TextField
                label="PHẦN TRĂM GIẢM (%)"
                name="discountPercent"
                type="number"
                value={formData.discountPercent}
                onChange={handleChange}
                error={!!errors.discountPercent}
                helperText={errors.discountPercent || "Nhập số từ 1–100"}
                fullWidth
                required
                inputProps={{ min: 1, max: 100 }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="NGÀY BẮT ĐẦU"
                  name="dateStart"
                  type="date"
                  value={formData.dateStart}
                  onChange={handleChange}
                  error={!!errors.dateStart}
                  helperText={errors.dateStart}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
                <TextField
                  label="NGÀY KẾT THÚC"
                  name="dateFinish"
                  type="date"
                  value={formData.dateFinish}
                  onChange={handleChange}
                  error={!!errors.dateFinish}
                  helperText={errors.dateFinish}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
              </Stack>

              {formData.dateStart &&
                formData.dateFinish &&
                new Date(formData.dateFinish) <
                  new Date(formData.dateStart) && (
                  <Alert severity="error">
                    NGÀY KẾT THÚC PHẢI SAU HOẶC BẰNG NGÀY BẮT ĐẦU
                  </Alert>
                )}

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={handleReset}>
                  LÀM MỚI
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                >
                  TẠO MÃ GIẢM GIÁ
                </Button>
              </Stack>
            </Stack>
          </form>
          <Dialog open={dialogOpen} onClose={handleClose}>
            <DialogTitle>MÃ GIẢM GIÁ CỦA BẠN</DialogTitle>
            <DialogContent>
              <Typography
                variant="h6"
                color="primary"
                align="center"
                sx={{ mt: 1 }}
              >
                {discountCode || "Không có mã"}
              </Typography>
              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                HÃY LƯU MÃ NÀY ĐỂ DÙNG KHI THANH TOÁN.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCopy}>COPY MÃ</Button>
              <Button onClick={handleClose} autoFocus>
                ĐÓNG
              </Button>
            </DialogActions>

          </Dialog>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={2000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert severity="success" sx={{ width: "100%" }}>
              ✅ Đã copy mã giảm giá vào clipboard!
            </Alert>
          </Snackbar>
        </Box>
      </Box>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
};

export default CreateDiscountPage;
