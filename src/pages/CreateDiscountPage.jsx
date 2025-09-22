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
} from "@mui/material";
import axios from "axios";

const CreateDiscountPage = () => {
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
      newErr.discountName = "Vui lòng nhập tên chương trình";

    const percent = Number(formData.discountPercent);
    if (!formData.discountPercent)
      newErr.discountPercent = "Vui lòng nhập % giảm";
    else if (isNaN(percent) || percent < 1 || percent > 100)
      newErr.discountPercent = "Phần trăm giảm phải từ 1 đến 100";

    if (!formData.dateStart) newErr.dateStart = "Vui lòng chọn ngày bắt đầu";
    if (!formData.dateFinish) newErr.dateFinish = "Vui lòng chọn ngày kết thúc";

    if (formData.dateStart && formData.dateFinish) {
      const start = new Date(formData.dateStart);
      const finish = new Date(formData.dateFinish);
      if (finish < start)
        newErr.dateFinish = "Ngày kết thúc phải ≥ ngày bắt đầu";
    }

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await axios.post("http://localhost:8080/api/v1/discounts/generate", {
        discountName: formData.discountName,
        discountPercent: formData.discountPercent,
        dateStart: formData.dateStart,
        dateFinish: formData.dateFinish,
      });

      if (res.data?.discountCode !== undefined) {
        setDiscountCode(res.data.discountCode);
        setDialogOpen(true);
      } else {
        alert("Tạo mã thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi gọi API!");
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
      alert("Đã copy mã giảm giá vào clipboard!");
    } catch {
      alert("Không thể copy, vui lòng copy thủ công.");
    }
  };

  return (
    <Box sx={{
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    pt: 12,
    backgroundColor: "#f5f5f5",
  }}>
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
        Tạo mã giảm giá
      </Typography>

      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          <TextField
            label="Tên chương trình"
            name="discountName"
            value={formData.discountName}
            onChange={handleChange}
            error={!!errors.discountName}
            helperText={errors.discountName}
            fullWidth
            required
          />
          <TextField
            label="Phần trăm giảm (%)"
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
              label="Ngày bắt đầu"
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
              label="Ngày kết thúc"
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

          {formData.dateStart && formData.dateFinish && new Date(formData.dateFinish) < new Date(formData.dateStart) && (
            <Alert severity="error">Ngày kết thúc phải sau hoặc bằng ngày bắt đầu</Alert>
          )}

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={handleReset}>
              Làm mới
            </Button>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Tạo mã
            </Button>
          </Stack>
        </Stack>
      </form>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Mã giảm giá của bạn</DialogTitle>
        <DialogContent>
          <Typography variant="h6" color="primary" align="center" sx={{ mt: 1 }}>
            {discountCode || "Không có mã"}
          </Typography>
          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            Hãy lưu mã này để dùng khi thanh toán.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopy}>Copy mã</Button>
          <Button onClick={handleClose} autoFocus>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Box>
  );
};

export default CreateDiscountPage;