import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Box, Button } from '@mui/material';
import {
  Table, TableBody, TableCell, MenuItem, TableContainer, TableHead,Select, TableRow, Paper, Typography, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Products = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [updateId, setUpdateId] = useState(null);
  const [updateName, setUpdateName] = useState("");
  const [updatePrice, setUpdatePrice] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [updateCategoryId, setUpdateCategoryId] = useState("");
  const [updateTrademarkId, setUpdateTrademarkId] = useState("");
  const [updateDate, setUpdateDate] = useState("");
  const [updateImageFile, setUpdateImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trademarks, setTrademarks] = useState([]);
  const [openImage, setOpenImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleOpenImage = (img) => {
  setSelectedImage(img);
  setOpenImage(true);
  };
  const handleCloseImage = () => {
  setOpenImage(false);
  setSelectedImage(null);
  };
  const handleOpenUpdate = async (id) => {
  try {
    const res = await axios.get(`http://localhost:8080/api/v1/product/${id}/get`);
    const product = res.data;

    setUpdateId(id);
    setUpdateName(product.name || "");
    setUpdatePrice(product.price || "");
    setUpdateDescription(product.description || "");
    setUpdateCategoryId(product.categoryId || product.category_id || "");
    setUpdateTrademarkId(product.trademarkId || product.trademark_id || "");
    setUpdateCategoryId(product.categoryId || "");
    setUpdateTrademarkId(product.trademarkId || "");
    setUpdateDate(product.date_product || "");
    setUpdateImageFile(null);
    setOpenUpdate(true);
  } catch (err) {
    console.error("Lỗi khi load sản phẩm:", err);
    toast.error("Không thể tải dữ liệu sản phẩm!");
  }
  };
  const handleCloseUpdate = () => {
  setOpenUpdate(false);
  setUpdateId(null);
  setUpdateName("");
  };
  const handleConfirmUpdate = async () => {
  try {
    const formData = new FormData();
    formData.append("name", updateName);
    formData.append("price", updatePrice);
    formData.append("description", updateDescription);
    formData.append("categoryId", updateCategoryId);
    formData.append("trademarkId", updateTrademarkId);
    formData.append("date_product", updateDate);

    if (updateImageFile) {
      formData.append("image", updateImageFile);
    }

    await axios.put(
      `http://localhost:8080/api/v1/product/update/${updateId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    toast.success("Cập nhật sản phẩm thành công!");
    handleCloseUpdate();

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (err) {
    console.error("Lỗi khi cập nhật:", err);
    toast.error("Có lỗi xảy ra khi cập nhật sản phẩm!");
  }
  };
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:8080/api/v1/product/import",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success(res.data.message || "Tải file thành công!");
      setTimeout(() => {
      window.location.reload();
    }, 1000);
    } catch (err) {
      console.error("Lỗi upload:", err);
      toast.error("Có lỗi khi tải file!");
    }
  };
  const handleOpenDetail = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/product/${id}/get`);
      setSelectedProduct(res.data);
      setOpen(true);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
      toast.error("Không thể tải chi tiết sản phẩm!");
    }
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
  };
  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setOpenDelete(true);
  };
  const handleCloseDelete = () => {
    setOpenDelete(false);
    setDeleteId(null);
  };
  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/product/download",
        { responseType: "blob" } 
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "API-PRODUCT.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Tải file mẫu thành công!");
    } catch (error) {
      console.error("Lỗi khi tải file:", error);
      toast.error("Không thể tải file mẫu!");
    }
  };
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/product/delete/${deleteId}`);
      toast.success("Xóa sản phẩm thành công!");
      handleCloseDelete();

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      toast.error("Có lỗi xảy ra khi xóa sản phẩm!");
    }
  };
  useEffect(() => {
    axios.get('http://localhost:8080/api/v1/product/getall')
      .then(response => {
        setProducts(response.data);
        toast.success("Tải danh sách sản phẩm thành công!");
      })
      .catch(error => {
        toast.error("Không thể tải danh sách sản phẩm!");
      });
  }, []);
  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/category/Listgetall");
      setCategories(res.data);
      toast.success("Tải danh sách loại sản phẩm thành công!");
    } catch (err) {
      console.error("Lỗi khi load categories:", err);
      toast.error("Không thể tải danh sách loại sản phẩm!");
    }
  };
  const fetchTrademarks = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/trademark/gettrademark");
      setTrademarks(res.data);
      toast.success("Tải danh sách thương hiệu thành công!");
    } catch (err) {
      console.error("Lỗi khi load trademarks:", err);
      toast.error("Không thể tải danh sách thương hiệu!");
    }
  };
  fetchCategories();
  fetchTrademarks();
  }, []);
return (
<Box sx={{ p: 2, m: 0, width: '100%' }}>
  <Typography variant="h5" gutterBottom sx={{ px: 2, pt: 2, pb: 1 }}>
    Danh sách sản phẩm
  </Typography>
  <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} color="primary"  onClick={() => navigate("/add-product")}>
              Thêm Sản Phẩm Mặc Định
            </Button>
            <Button variant="contained" startIcon={<CloudDownloadIcon />} color="info" onClick={handleDownloadTemplate}>
              Tải File Mẫu
            </Button>
            <Button variant="contained" startIcon={<CloudUploadIcon />} color="success" onClick={handleButtonClick}>
              Tải Lên File Excel
            </Button>
            <input type="file" accept=".xlsx,.xls" style={{ display: "none" }} ref={fileInputRef} onChange={handleFileChange}/>
  </Box>
  <TableContainer component={Paper} sx={{ width: '100%', boxShadow: 'none', borderRadius: 0 }}>
    <Table>
      <TableHead sx={{ backgroundColor: '#2563EB' }}>
        <TableRow>
          <TableCell sx={{ color: 'white', fontSize: '1.2rem' }}>ẢNH</TableCell>
          <TableCell sx={{ color: 'white', fontSize: '1.2rem' }}>TÊN SẢN PHẨM</TableCell>
          <TableCell sx={{ color: 'white', fontSize: '1.2rem' }}>LOẠI</TableCell>
          <TableCell sx={{ color: 'white', fontSize: '1.2rem' }}>THƯƠNG HIỆU</TableCell>
          <TableCell sx={{ color: 'white', fontSize: '1.2rem' }}>GIÁ</TableCell>
          <TableCell sx={{ color: 'white', fontSize: '1.2rem' }}>NGÀY SẢN XUẤT</TableCell>
          <TableCell sx={{ color: 'white', fontSize: '1.2rem' }}>MÔ TẢ</TableCell>
          <TableCell sx={{ color: 'white', fontSize: '1.2rem' }}>CHỨC NĂNG</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <Avatar
                variant="square"
                src={product.imageBase64 ? `data:image/jpeg;base64,${product.imageBase64}` : ''} 
                alt={product.name}
                sx={{ width: 80, height: 80 }}
                onClick={() => handleOpenImage(`data:image/jpeg;base64,${product.imageBase64}`)}
              />
            </TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.categoryname}</TableCell>
            <TableCell>{product.tradeName}</TableCell>
            <TableCell>{product.price?.toLocaleString()} VNĐ</TableCell>
            <TableCell>{product.date_product}</TableCell>
            <TableCell>{product.description}</TableCell>
            <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" color="primary" size="small" onClick={() => handleOpenUpdate(product.id)}>
            Cập nhật
          </Button>
          <Button variant="contained" color="error" size="small" onClick={() => handleOpenDelete(product.id)}>
            Xóa
          </Button>
          <Button variant="outlined" color="info" size="small" onClick={() => handleOpenDetail(product.id)}>
            Chi tiết
          </Button>
        </Box>
      </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết sản phẩm</DialogTitle>
        <DialogContent dividers>
          {selectedProduct ? (
            <>
              <Typography><b>Tên sản phẩm:</b> {selectedProduct.name}</Typography>
              <Typography><b>Loại:</b> {selectedProduct.categoryname}</Typography>
              <Typography><b>Giá:</b> {selectedProduct.price?.toLocaleString()} VNĐ</Typography>
              <Typography><b>Ngày sản xuất:</b> {selectedProduct.date_product}</Typography>
              <Typography><b>Mô tả:</b> {selectedProduct.description}</Typography>
              <img
                src={
                  selectedProduct.imageBase64
                    ? `data:image/jpeg;base64,${selectedProduct.imageBase64}`
                    : ""
                }
                alt={selectedProduct.name}
                style={{ width: "100%", marginTop: "10px" }}
              />
            </>
          ) : (
            <Typography>Đang tải...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="primary">
            Đóng
          </Button>
        </DialogActions>
  </Dialog>
  <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa sản phẩm này không?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} variant="outlined">
            Hủy
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Đồng ý
          </Button>
        </DialogActions>
  </Dialog>
  <Dialog open={openImage} onClose={handleCloseImage} maxWidth="md">
  <DialogContent>
    {selectedImage && (
      <img src={selectedImage} alt="Preview" style={{ width: '100%', height: 'auto' }} />
    )}
  </DialogContent>
  </Dialog>
  <Dialog open={openUpdate} onClose={handleCloseUpdate} maxWidth="sm" fullWidth>
  <DialogTitle>Cập nhật sản phẩm</DialogTitle>
  <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
    <TextField
      label="Tên sản phẩm"
      value={updateName}
      onChange={(e) => setUpdateName(e.target.value)}
      fullWidth
  />
    <TextField
      label="Giá"
      type="number"
      value={updatePrice}
      onChange={(e) => setUpdatePrice(e.target.value)}
      fullWidth
    />

    <TextField
      label="Mô tả"
      multiline
      rows={3}
      value={updateDescription}
      onChange={(e) => setUpdateDescription(e.target.value)}
      fullWidth
    />
  <FormControl fullWidth>
  <InputLabel id="category-label">Loại sản phẩm</InputLabel>
  <Select
    labelId="category-label"
    value={updateCategoryId || ""}
    onChange={(e) => setUpdateCategoryId(e.target.value)}
  >
    {categories.map((cat) => (
      <MenuItem key={cat.id} value={String(cat.id)}>
        {cat.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>
<FormControl fullWidth>
  <InputLabel id="trademark-label">Thương hiệu</InputLabel>
  <Select
    labelId="trademark-label"
    value={updateTrademarkId || ""}
    onChange={(e) => setUpdateTrademarkId(e.target.value)}
  >
    {trademarks.map((tr) => (
      <MenuItem key={tr.tradeID} value={String(tr.tradeID)}>
        {tr.tradeName}
      </MenuItem>
    ))}
  </Select>
</FormControl>
    <TextField
      label="Ngày sản xuất"
      type="date"
      value={updateDate}
      onChange={(e) => setUpdateDate(e.target.value)}
      InputLabelProps={{ shrink: true }}
      fullWidth
    />
    <Button
      variant="outlined"
      component="label"
    >
      Chọn ảnh
      <input
        type="file"
        hidden
        accept="image/*"
        onChange={(e) => setUpdateImageFile(e.target.files[0])}
      />
    </Button>
    {updateImageFile && <Typography>Ảnh đã chọn: {updateImageFile.name}</Typography>}
  </DialogContent>

  <DialogActions>
    <Button onClick={handleCloseUpdate}>Hủy</Button>
    <Button onClick={handleConfirmUpdate} variant="contained" color="primary">
      Lưu thay đổi
    </Button>
  </DialogActions>
  </Dialog>
  <ToastContainer position="top-right" autoClose={3000} />
</Box>
);};

export default Products;
