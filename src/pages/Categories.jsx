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

const Categories = () => {
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [openUpdate, setOpenUpdate] = useState(false);
  const [updateId, setUpdateId] = useState(null);
  const [updateName, setUpdateName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/v1/category/Listgetall"
      );
      setCategories(res.data);
      toast.success("Tải danh sách loại sản phẩm thành công!");
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
      await axios.post("http://localhost:8080/api/v1/category/add", {
        name: newName,
      });
      toast.success("Thêm loại sản phẩm thành công!");
      handleCloseAdd();
      fetchCategories();
    } catch (err) {
      console.error("Lỗi khi thêm category:", err);
      toast.error("Có lỗi xảy ra khi thêm loại sản phẩm!");
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
        `http://localhost:8080/api/v1/category/${updateId}/update`,
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
        `http://localhost:8080/api/v1/category/${deleteId}/delete`
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
        "http://localhost:8080/api/v1/category/import",
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
        "http://localhost:8080/api/v1/category/download",
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "API-CATEGORY.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Lỗi khi tải file:", error);
      toast.error("Không thể tải file mẫu!");
    }
  };

  return (
    <Box sx={{ p: 2, m: 0, width: "100%" }}>
      <Typography variant="h5" gutterBottom sx={{ px: 2, pt: 2, pb: 1 }}>
        Danh sách loại sản phẩm
      </Typography>

      <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
          onClick={handleOpenAdd}
        >
          Thêm Loại Sản Phẩm
        </Button>
        <Button
          variant="contained"
          startIcon={<CloudDownloadIcon />}
          color="info"
          onClick={handleDownloadTemplate}
        >
          Tải File Mẫu
        </Button>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          color="success"
          onClick={handleButtonClick}
        >
          Tải Lên File Excel
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
                Tên Loại
              </TableCell>
              <TableCell sx={{ color: "white", fontSize: "1.2rem" }}>
                Chức Năng
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
                      Cập nhật
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleOpenDelete(cat.id)}
                    >
                      Xóa
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openAdd} onClose={handleCloseAdd}>
        <DialogTitle>Thêm loại sản phẩm</DialogTitle>
        <DialogContent>
          <TextField
            label="Tên loại"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdd}>Hủy</Button>
          <Button
            onClick={handleConfirmAdd}
            variant="contained"
            color="primary"
          >
            Thêm
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openUpdate} onClose={handleCloseUpdate}>
        <DialogTitle>Cập nhật loại sản phẩm</DialogTitle>
        <DialogContent>
          <TextField
            label="Tên loại"
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
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa loại sản phẩm này không?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Hủy</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Xóa
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
