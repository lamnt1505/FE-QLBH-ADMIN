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
import API_BASE_URL from "../config/config.js";

const Trademarks = () => {
  const fileInputRef = useRef(null);
  const [trademarks, setTrademarks] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [openUpdate, setOpenUpdate] = useState(false);
  const [updateId, setUpdateId] = useState(null);
  const [updateName, setUpdateName] = useState("");

  useEffect(() => {
    fetchTrademarks();
  }, []);
  const fetchTrademarks = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/trademark/gettrademark`
      );
      setTrademarks(res.data);
    } catch (err) {
      console.error("Lỗi khi tải trademarks:", err);
    }
  };
  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => {
    setOpenAdd(false);
    setNewName("");
  };
  const handleConfirmAdd = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/trademark/add`, {
        tradeName: newName.trim(),
      });
      toast.success("✅ Thêm thương hiệu thành công!");
      handleCloseAdd();
      fetchTrademarks();
    } catch (err) {
      console.error("Lỗi khi thêm trademark:", err);
      if (err.response) {
        const { status, data } = err.response;

        if (status === 409 && data.error) {
          toast.error(`⚠️ ${data.error}`); // lỗi trùng thương hiệu
        } else if (status === 400 && data.error) {
          toast.error(`⚠️ ${data.error}`); // lỗi dữ liệu không hợp lệ
        } else {
          toast.error("❌ Có lỗi xảy ra khi thêm thương hiệu!");
        }
      } else {
        toast.error("🚫 Không thể kết nối đến server!");
      }
    }
  };
  const handleOpenUpdate = (trademark) => {
    setUpdateId(trademark.tradeID);
    setUpdateName(trademark.trademarkName);
    setOpenUpdate(true);
  };
  const handleCloseUpdate = () => {
    setOpenUpdate(false);
    setUpdateId(null);
    setUpdateName("");
  };
  const handleConfirmUpdate = async () => {
    if (!updateId) {
      toast.warning("Không có ID để cập nhật!");
      return;
    }
    try {
      await axios.put(
        `${API_BASE_URL}/api/trademark/update/${updateId}`,
        {
          tradeID: updateId,
          tradeName: updateName,
        }
      );
      toast.success("Cập nhật thành công!");
      handleCloseUpdate();
      fetchTrademarks();
    } catch (err) {
      console.error("Lỗi update trademark:", err);
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
        `${API_BASE_URL}/api/trademark/delete/${deleteId}`
      );
      toast.success("Xóa thành công!");
      handleCloseDelete();
      fetchTrademarks();
    } catch (err) {
      console.error("Lỗi khi xóa trademark:", err);
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
        `${API_BASE_URL}/api/trademark/import`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(res.data.message || "Import thành công!");
      fetchTrademarks();
    } catch (err) {
      console.error("Lỗi import:", err);
      toast.error("Import thất bại!");
    }
  };
  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/trademark/download`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "API-TRADEMARK.xlsx");
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
        DANH SÁCH THƯƠNG HIỆU (Trademark)
      </Typography>

      <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
          onClick={handleOpenAdd}
        >
          THÊM MỚI
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
                TÊN THƯƠNG HIỆU
              </TableCell>
              <TableCell sx={{ color: "white", fontSize: "1.2rem" }}>
                CHỨC NĂNG
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trademarks.map((trademark) => (
              <TableRow key={trademark.tradeID}>
                <TableCell>{trademark.tradeID}</TableCell>
                <TableCell>{trademark.tradeName}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleOpenUpdate(trademark)}
                    >
                      CẬP NHẬT
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleOpenDelete(trademark.tradeID)}
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
      <Dialog open={openAdd} onClose={handleCloseAdd}>
        <DialogTitle>THÊM THƯƠNG HIỆU</DialogTitle>
        <DialogContent>
          <TextField
            label="TÊN THƯƠNG HIỆU"
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
            THÊM
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openUpdate} onClose={handleCloseUpdate}>
        <DialogTitle>CẬP NHẬT THƯƠNG HIỆU</DialogTitle>
        <DialogContent>
          <TextField
            label="TÊN THƯƠNG HIỆU"
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
          BẠN CÓ CHẮC MUỐN XÓA THƯƠNG HIỆU NÀY KHÔNG?
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
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

export default Trademarks;
