import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, MenuItem } from "@mui/material";
import axios from "axios";
import API_BASE_URL from "../config/config.js";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Products/addProduct.css";

export default function AddProduct() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date_product: "",
    price: "",
    categoryID: "",
    tradeID: "",
  });

  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trademarks, setTrademarks] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/v1/category/Listgetall`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Lỗi load categories:", err));
    axios
      .get(`${API_BASE_URL}/api/trademark/gettrademark`)
      .then((res) => {
        console.log("Trademarks API:", res.data);
        setTrademarks(res.data);
      })
      .catch((err) => console.error("Lỗi load trademarks:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim())
      newErrors.name = "Tên sản phẩm không được để trống";
    if (!formData.description.trim())
      newErrors.description = "Mô tả không được để trống";
    if (!formData.date_product)
      newErrors.date_product = "Vui lòng chọn ngày sản xuất";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Giá phải lớn hơn 0";
    if (!formData.categoryID)
      newErrors.categoryID = "Vui lòng chọn loại sản phẩm";
    if (!formData.tradeID) newErrors.tradeID = "Vui lòng chọn thương hiệu";
    if (!image) newErrors.image = "Vui lòng chọn ảnh sản phẩm";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.warning("Vui lòng kiểm tra lại các trường bắt buộc!", {
        position: "top-center",
      });
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    data.append("image", image);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/product/add`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(
        "🎉 Thêm sản phẩm thành công! Sẽ chuyển hướng sau 10 giây...",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );

      console.log("Kết quả:", res.data);
      setTimeout(() => navigate("/products"), 2000);
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      if (error.response) {
        const { status, data } = error.response;

        if (status === 409) {
          toast.error(data.error || "⚠️ Tên sản phẩm đã tồn tại!");
        } else if (status === 400) {
          toast.error(
            data.error || "⚠️ Không tìm thấy danh mục hoặc thương hiệu!"
          );
        } else if (status === 500) {
          toast.error(data.error || "❌ Lỗi máy chủ, vui lòng thử lại!");
        } else {
          toast.error("❌ Thêm sản phẩm thất bại!");
        }
      } else {
        toast.error("🚫 Không thể kết nối đến máy chủ!");
      }
    }
  };

  return (
    <>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#f8fafc",
          minHeight: "calc(100vh - 64px)",
          py: 6,
        }}
      >
        <Box
          sx={{
            p: 4,
            width: "90%",
            maxWidth: 900,
            backgroundColor: "#fff",
            borderRadius: 3,
            boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            color="primary"
            gutterBottom
          >
            🧾 THÊM SẢN PHẨM MỚI
          </Typography>

          {/* Giao diện chia 2 cột */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 3,
              mt: 2,
            }}
          >
            {/* Cột trái */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Tên sản phẩm"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                error={!!errors.name}
                helperText={errors.name}
              />

              <TextField
                label="Giá (₫)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                fullWidth
                error={!!errors.price}
                helperText={errors.price}
              />

              <TextField
                label="Loại sản phẩm"
                name="categoryID"
                select
                value={formData.categoryID}
                onChange={handleChange}
                fullWidth
                error={!!errors.categoryID}
                helperText={errors.categoryID}
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Thương hiệu"
                name="tradeID"
                select
                value={formData.tradeID}
                onChange={handleChange}
                fullWidth
                error={!!errors.tradeID}
                helperText={errors.tradeID}
              >
                {trademarks.map((t) => (
                  <MenuItem key={t.tradeID} value={t.tradeID}>
                    {t.tradeName}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Ngày sản xuất"
                name="date_product"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.date_product}
                onChange={handleChange}
                fullWidth
                error={!!errors.date_product}
                helperText={errors.date_product}
              />
            </Box>

            {/* Cột phải */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button variant="outlined" component="label" fullWidth>
                📷 Chọn ảnh
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
              {image && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: 1,
                  }}
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    style={{
                      width: 150,
                      height: 150,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "1px solid #ccc",
                    }}
                  />
                </Box>
              )}
              {errors.image && (
                <Typography variant="body2" color="error" sx={{ mt: -1 }}>
                  {errors.image}
                </Typography>
              )}

              <TextField
                label="Mô tả sản phẩm"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={6}
                fullWidth
                error={!!errors.description}
                helperText={errors.description}
              />
            </Box>
          </Box>

          {/* Nút hành động */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 4,
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{
                flex: 1,
                py: 1.2,
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              ➕ Lưu sản phẩm
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate("/products")}
              sx={{
                flex: 1,
                py: 1.2,
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              ⬅ Quay lại
            </Button>
          </Box>
        </Box>
      </Box>
      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
}
