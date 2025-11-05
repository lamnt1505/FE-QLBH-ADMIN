import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Box, Button } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import API_BASE_URL from "../config/config.js";

const Categories = () => {
  const location = useLocation();
  const msg = location.state?.msg || "";
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [openUpdate, setOpenUpdate] = useState(false);
  const [updateId, setUpdateId] = useState(null);
  const [updateName, setUpdateName] = useState("");

useEffect(() => {
  if (location.state?.msg) {
    toast.error(location.state.msg, {
      position: "top-right",
      autoClose: 3000,
    });
    
    window.history.replaceState({}, document.title);
  }
}, [location.state]);


  useEffect(() => {
    fetchCategories();
  }, [page, size]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/category/paginated`,
        {
          params: {
            page,
            size,
            sort: ["categoryID", "asc"],
          },
        }
      );

      setCategories(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Không thể tải danh sách loại sản phẩm!");
    }
  };

  const handleOpenAdd = () => setOpenAdd(true);

  const handleCloseAdd = () => {
    setOpenAdd(false);
    setNewName("");
  };
  const handleConfirmAdd = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/v1/category/add`, {
        name: newName,
      });
      toast.success("Thêm loại sản phẩm thành công!");
      handleCloseAdd();
      fetchCategories();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.error(err.response.data.error || "Tên Loại sản phẩm đã tồn tại!");
      } else {
        toast.error("Có lỗi xảy ra khi thêm danh mục!");
      }
    }
  };
  const handleOpenUpdate = (cat) => {
    setUpdateId(cat.id);
    setUpdateName(cat.name);
    setOpenUpdate(true);
  };
  const handleCloseUpdate = () => {
    setOpenUpdate(false);
    setUpdateId(null);
    setUpdateName("");
  };
  const handleConfirmUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/v1/category/${updateId}/update`,
        {
          name: updateName,
        }
      );
      toast.success("Cập nhật thành công!");
      handleCloseUpdate();
      fetchCategories();
    } catch (err) {
      console.error("Lỗi update category:", err);
      toast.error("Có lỗi xảy ra khi cập nhật!");
    }
  };

  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/v1/category/${deleteId}/delete`
      );
      toast.success("Xóa thành công!");
      handleCloseDelete();
      fetchCategories();
    } catch (err) {
      console.error("Lỗi khi xóa category:", err);
      toast.error("Có lỗi xảy ra khi xóa!");
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
         `${API_BASE_URL}/api/v1/category/import`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(res.data.message || "Import thành công!");
      fetchCategories();
    } catch (err) {
      console.error("Lỗi import:", err);
      toast.error("Import thất bại!");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(
         `${API_BASE_URL}/api/v1/category/download`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "API-CATEGORY.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Tải file mẫu thành công!");
    } catch (error) {
      console.error("Lỗi khi tải file:", error);
      toast.error("Không thể tải file mẫu!");
    }
  };

  return (
    <Box sx={{ px: 2, pt: 2, pb: 1, width: "100%" }}>
      <Typography variant="h5" gutterBottom sx={{ px: 2, pt: 2, pb: 1 }}>
        DANH SÁCH LOẠI SẢN PHẨM
      </Typography>

      <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
          onClick={handleOpenAdd}
        >
          THÊM LOẠI SẢN PHẨM
        </Button>
        <Button
          variant="contained"
          startIcon={<CloudDownloadIcon />}
          color="info"
          onClick={handleDownloadTemplate}
        >
          TẢI FILE MẪU
        </Button>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          color="success"
          onClick={handleButtonClick}
        >
          TẢI LÊN FILE EXCEL
        </Button>
        <input
          type="file"
          accept=".xlsx,.xls"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </Box>

      <TableContainer
        component={Paper}
        sx={{ width: "100%", boxShadow: "none", borderRadius: 0 }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#2563EB" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontSize: "1.2rem" }}>
                ID
              </TableCell>
              <TableCell sx={{ color: "white", fontSize: "1.2rem" }}>
                TÊN LOẠI
              </TableCell>
              <TableCell sx={{ color: "white", fontSize: "1.2rem" }}>
                CHỨC NĂNG
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.id}</TableCell>
                <TableCell>{cat.name || cat.categoryName}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleOpenUpdate(cat)}
                    >
                      CẬP NHẬT
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleOpenDelete(cat.id)}
                    >
                      XÓA
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button
          variant="outlined"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          sx={{ mr: 1 }}
        >
          Trước
        </Button>
        <Typography sx={{ mx: 2, alignSelf: "center" }}>
          Trang {page + 1} / {totalPages}
        </Typography>
        <Button
          variant="outlined"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
          sx={{ ml: 1 }}
        >
          Sau
        </Button>
      </Box>
      <Dialog open={openAdd} onClose={handleCloseAdd}>
        <DialogTitle>THÊM LOẠI SẢN PHẨM</DialogTitle>
        <DialogContent>
          <TextField
            label="TÊN LOẠI"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd}>HỦY</Button>
          <Button
            onClick={handleConfirmAdd}
            variant="contained"
            color="primary"
          >
            THÊM MỚI
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openUpdate} onClose={handleCloseUpdate}>
        <DialogTitle>CẬP NHẬT LOẠI SẢN PHẨM</DialogTitle>
        <DialogContent>
          <TextField
            label="TÊN LOẠI"
            value={updateName}
            onChange={(e) => setUpdateName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdate}>Hủy</Button>
          <Button
            onClick={handleConfirmUpdate}
            variant="contained"
            color="primary"
          >
            LƯU
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>XÁC NHẬN XÓA</DialogTitle>
        <DialogContent>
          BẠN CÓ CHẮC MUỐN XÓA LOẠI SẢN PHẨM NÀY KHÔNG?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>HỦY</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            XÓA
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
      />
    </Box>
  );
};

export default Categories;
