import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const StatisticsPage = () => {
  const [role, setRole] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [productStats, setProductStats] = useState([]);
  const [yearStats, setYearStats] = useState([]);
  const [monthStats, setMonthStats] = useState([]);
  const [quarterStats, setQuarterStats] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [profitStats, setProfitStats] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = (end - start) / (1000 * 60 * 60 * 24);
  const [discountStats, setDiscountStats] = useState([]);

  useEffect(() => {
    const fetchDiscountStats = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/api/export/statistics/discount"
        );
        setDiscountStats(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Lỗi khi tải thống kê mã giảm giá!");
      }
    };
    fetchDiscountStats();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, yearRes, monthRes, quarterRes] = await Promise.all([
          axios.get("http://localhost:8080/api/statistics/product"),
          axios.get("http://localhost:8080/api/statistics/year"),
          axios.get("http://localhost:8080/api/statistics/month"),
          axios.get("http://localhost:8080/api/statistics/quarter"),
        ]);

        setProductStats(productRes.data);
        setYearStats(yearRes.data);
        setMonthStats(monthRes.data);
        setQuarterStats(quarterRes.data);
      } catch (err) {
        console.error("Lỗi khi load dữ liệu:", err);
        toast.error("Không thể load dữ liệu. Vui lòng thử lại!");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const accountData = localStorage.getItem("account");
    if (accountData) {
      try {
        const parsed = JSON.parse(accountData);
        if (parsed.role) {
          setRole(parsed.role);
        } else if (parsed.isAdmin) {
          setRole("ADMIN");
        } else if (parsed.isEmployee) {
          setRole("EMPLOYEE");
        } else if (parsed.isUser) {
          setRole("USER");
        } else {
          setRole("UNKNOWN");
        }
      } catch (err) {
        console.error("Lỗi parse account:", err);
      }
    }
  }, []);

  if (role === null) {
    return <p>Đang kiểm tra quyền truy cập...</p>;
  }

  const handleExportQuarterExcel = async () => {
    try {
      const res = await fetch(
        "http://localhost:8080/api/export/quarter/export-excel",
        {
          method: "GET",
        }
      );

      if (!res.ok) throw new Error("Xuất Excel thất bại!");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "thong_ke_quy.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xuất Excel theo quý");
    }
  };

  const handleExportQuarterPDF = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/reports/quarter", {
        method: "GET",
      });

      if (!res.ok) throw new Error("Xuất PDF thất bại!");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "quarter-statistics.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xuất PDF theo quý");
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportExcel = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/export/product", {
        method: "GET",
      });

      if (!res.ok) throw new Error("Xuất Excel thất bại!");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "statistical_product.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xuất Excel");
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/reports/product", {
        method: "GET",
      });

      if (!res.ok) throw new Error("Xuất PDF thất bại!");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "product-statistics.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xuất PDF");
    }
  };

  const handleExportYearExcel = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/export/year", {
        method: "GET",
      });

      if (!res.ok) throw new Error("Xuất Excel thất bại!");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "statistical_year.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xuất Excel theo năm");
    }
  };

  const handleExportYearPDF = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/reports/year", {
        method: "GET",
      });

      if (!res.ok) throw new Error("Xuất PDF thất bại!");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "year-statistics.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xuất PDF theo năm");
    }
  };

  const handleExportMonthExcel = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/export/month", {
        method: "GET",
      });

      if (!res.ok) throw new Error("Xuất Excel thất bại!");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "statistical_month.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xuất Excel theo tháng");
    }
  };

  const handleExportMonthPDF = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/reports/month", {
        method: "GET",
      });

      if (!res.ok) throw new Error("Xuất PDF thất bại!");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "month-statistics.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi xuất PDF theo tháng");
    }
  };

  if (role && role !== "ADMIN") {
    return (
      <Navigate
        to="/categories"
        state={{ msg: "Tài khoản bạn có quyền để sử dụng thống kê!" }}
      />
    );
  }

  const tableStyles = {
    header: {
      backgroundColor: "#1976d2",
      color: "white",
      fontWeight: "bold",
      fontSize: "1rem",
      textAlign: "center",
    },
    cell: {
      textAlign: "center",
      fontSize: "0.95rem",
    },
    container: {
      boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
      borderRadius: "8px",
      mb: 3,
    },
  };

  const renderNumber = (num) => new Intl.NumberFormat().format(num);

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        THỐNG KÊ ĐƠN HÀNG
      </Typography>
      <Tabs
        value={tabIndex}
        onChange={(e, newVal) => setTabIndex(newVal)}
        sx={{ mb: 3 }}
      >
        <Tab label="Sản phẩm" />
        <Tab label="Theo Năm" />
        <Tab label="Theo Tháng" />
        <Tab label="Theo Quý" />
        <Tab label="Lợi nhuận (Từ ngày → Đến ngày)" />
        <Tab label="Mã giảm giá" />
      </Tabs>
      <TabPanel value={tabIndex} index={0}>
                <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}
        >
          THỐNG KÊ SẢN PHẨM
        </Typography>
        <div className="d-flex justify-content-end mb-2">
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowDropDownIcon />}
            onClick={handleClick}
          >
            Xuất báo cáo
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem
              onClick={() => {
                handleExportExcel();
                handleClose();
              }}
            >
              <DownloadIcon fontSize="small" className="me-2" />
              XUẤT EXCEL
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExportPDF();
                handleClose();
              }}
            >
              <PictureAsPdfIcon fontSize="small" className="me-2" />
              XUẤT PDF
            </MenuItem>
          </Menu>
        </div>
        <TableContainer component={Paper} sx={tableStyles.container}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={tableStyles.header}>TÊN SẢN PHẨM</TableCell>
                <TableCell sx={tableStyles.header}>SỐ LƯỢNG BÁN</TableCell>
                <TableCell sx={tableStyles.header}>DOANH THU</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productStats.map((p) => (
                <TableRow key={p.id}>
                  <TableCell sx={tableStyles.cell}>{p.name}</TableCell>
                  <TableCell sx={tableStyles.cell}>
                    {renderNumber(p.quantitysold)}
                  </TableCell>
                  <TableCell sx={tableStyles.cell}>
                    {renderNumber(p.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
                <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}
        >
          THỐNG KÊ THEO NĂM
        </Typography>
        <div className="d-flex justify-content-end mb-2">
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowDropDownIcon />}
            onClick={handleClick}
          >
            Xuất báo cáo
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem
              onClick={() => {
                handleExportYearExcel();
                handleClose();
              }}
            >
              <DownloadIcon fontSize="small" className="me-2" />
              XUẤT EXCEL
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExportYearPDF();
                handleClose();
              }}
            >
              <PictureAsPdfIcon fontSize="small" className="me-2" />
              XUẤT PDF
            </MenuItem>
          </Menu>
        </div>
        <TableContainer component={Paper} sx={tableStyles.container}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={tableStyles.header}>NĂM</TableCell>
                <TableCell sx={tableStyles.header}>SỐ ĐƠN</TableCell>
                <TableCell sx={tableStyles.header}>TỔNG</TableCell>
                <TableCell sx={tableStyles.header}>MIN</TableCell>
                <TableCell sx={tableStyles.header}>MAX</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {yearStats.map((y) => (
                <TableRow key={y.year}>
                  <TableCell sx={tableStyles.cell}>{y.year}</TableCell>
                  <TableCell sx={tableStyles.cell}>
                    {renderNumber(y.orderCount)}
                  </TableCell>
                  <TableCell sx={tableStyles.cell}>
                    {renderNumber(y.total)}
                  </TableCell>
                  <TableCell sx={tableStyles.cell}>
                    {renderNumber(y.minTotal)}
                  </TableCell>
                  <TableCell sx={tableStyles.cell}>
                    {renderNumber(y.maxTotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      <TabPanel value={tabIndex} index={2}>
                <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}
        >
          THỐNG KÊ THEO THÁNG
        </Typography>
        <div className="d-flex justify-content-end mb-2">
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowDropDownIcon />}
            onClick={handleClick}
          >
            Xuất báo cáo
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem
              onClick={() => {
                handleExportMonthExcel();
                handleClose();
              }}
            >
              <DownloadIcon fontSize="small" className="me-2" />
              XUẤT EXCEL
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExportMonthPDF();
                handleClose();
              }}
            >
              <PictureAsPdfIcon fontSize="small" className="me-2" />
              XUẤT PDF
            </MenuItem>
          </Menu>
        </div>
        <TableContainer component={Paper} sx={tableStyles.container}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={tableStyles.header}>THÁNG</TableCell>
                <TableCell sx={tableStyles.header}>NĂM</TableCell>
                <TableCell sx={tableStyles.header}>SỐ ĐƠN</TableCell>
                <TableCell sx={tableStyles.header}>TỔNG</TableCell>
                <TableCell sx={tableStyles.header}>MIN</TableCell>
                <TableCell sx={tableStyles.header}>MAX</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthStats.map((m, index) => (
                <TableRow key={index}>
                  <TableCell sx={tableStyles.cell}>{m.month}</TableCell>
                  <TableCell sx={tableStyles.cell}>{m.year}</TableCell>
                  <TableCell sx={tableStyles.cell}>
                    {renderNumber(m.orderCount)}
                  </TableCell>
                  <TableCell sx={tableStyles.cell}>
                    {renderNumber(m.total)}
                  </TableCell>
                  <TableCell sx={tableStyles.cell}>
                    {renderNumber(m.minTotal)}
                  </TableCell>
                  <TableCell sx={tableStyles.cell}>
                    {renderNumber(m.maxTotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      <TabPanel value={tabIndex} index={3}>
                <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}
        >
          THỐNG KÊ THEO QUÝ
        </Typography>
        <div className="d-flex justify-content-end mb-2">
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowDropDownIcon />}
            onClick={handleClick}
          >
            Xuất báo cáo
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem
              onClick={() => {
                handleExportQuarterExcel();
                handleClose();
              }}
            >
              <DownloadIcon fontSize="small" className="me-2" />
              XUẤT EXCEL
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleExportQuarterPDF();
                handleClose();
              }}
            >
              <PictureAsPdfIcon fontSize="small" className="me-2" />
              XUẤT PDF
            </MenuItem>
          </Menu>
        </div>
        <TableContainer component={Paper} sx={tableStyles.container}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={tableStyles.header}>NĂM</TableCell>
                <TableCell sx={tableStyles.header}>QUÝ</TableCell>
                <TableCell sx={tableStyles.header}>SỐ ĐƠN</TableCell>
                <TableCell sx={tableStyles.header}>TỔNG</TableCell>
                <TableCell sx={tableStyles.header}>MIN</TableCell>
                <TableCell sx={tableStyles.header}>MAX</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quarterStats.map((q, index) => (
                <TableRow key={index}>
                  <TableCell sx={tableStyles.cell}>{q.year}</TableCell>
                  <TableCell sx={tableStyles.cell}>{q.quarter}</TableCell>
                  <TableCell sx={tableStyles.cell}>
                    {renderNumber(q.orderCount)}
                  </TableCell>
                  <TableCell sx={tableStyles.cell}>
                    {renderNumber(q.total)}
                  </TableCell>
                  <TableCell sx={tableStyles.cell}>
                    {renderNumber(q.minTotal)}
                  </TableCell>
                  <TableCell sx={tableStyles.cell}>
                    {renderNumber(q.maxTotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      <TabPanel value={tabIndex} index={4}>
                <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}
        >
          THỐNG KÊ LỢI NHUẬN THEO KHOẢN THỜI GIAN
        </Typography>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Paper
            sx={{
              p: 2,
              mb: 2,
              borderLeft: "4px solid #1976d2",
              backgroundColor: "#f5f9ff",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              Ghi chú cách tính:
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              • <strong>Doanh thu</strong>: Tổng tiền bán được trong khoảng thời
              gian đã chọn. <br />• <strong>Chi phí</strong>: Tổng giá vốn hàng
              bán (giá nhập hoặc chi phí sản xuất). <br />•{" "}
              <strong>Lợi nhuận</strong> = Doanh thu – Chi phí.
            </Typography>
          </Paper>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography>Chọn khoảng thời gian:</Typography>
            <input
              type="date"
              value={startDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />

            <Typography>đến</Typography>

            <input
              type="date"
              value={endDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />

            <Button
              variant="contained"
              color="success"
              sx={{ height: "40px", px: 3 }}
              onClick={async () => {
                if (!startDate || !endDate) {
                  toast.warning("Vui lòng chọn đủ khoảng thời gian!");
                  return;
                }

                const start = new Date(startDate);
                const end = new Date(endDate);
                const diffDays = (end - start) / (1000 * 60 * 60 * 24);

                if (diffDays < 0) {
                  toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
                  return;
                }

                if (diffDays > 30) {
                  toast.warning(
                    "Khoảng thời gian không được vượt quá 30 ngày!"
                  );
                  return;
                }

                try {
                  const res = await axios.get(
                    `http://localhost:8080/api/export/profit?startDate=${startDate}&endDate=${endDate}`
                  );
                  setProfitStats(res.data);
                } catch (err) {
                  console.error(err);
                  toast.error("Lỗi khi tải dữ liệu lợi nhuận!");
                }
              }}
            >
              Xem thống kê
            </Button>
          </Box>
        </Paper>
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: 3,
            borderRadius: 3,
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  TÊN SẢN PHẨM
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  DOANH THU
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  CHI PHÍ
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  LỢI NHUẬN
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profitStats.length > 0 ? (
                profitStats.map((item, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": { backgroundColor: "#f1faff" },
                      transition: "0.2s",
                    }}
                  >
                    <TableCell sx={{ textAlign: "center" }}>
                      {item.productName}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {item.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {item.cost.toLocaleString()}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        color: item.profit > 0 ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {item.profit.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: "center", py: 3 }}>
                    Chưa có dữ liệu trong khoảng này.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      <TabPanel value={tabIndex} index={5}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}
        >
          THỐNG KÊ MÃ GIẢM GIÁ KHÁCH HÀNG ĐÃ SỬ DỤNG
        </Typography>

        <TableContainer component={Paper} sx={tableStyles.container}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={tableStyles.header}>TÊN MÃ GIẢM GIÁ</TableCell>
                <TableCell sx={tableStyles.header}>SỐ LẦN SỬ DỤNG</TableCell>
                <TableCell sx={tableStyles.header}>
                  TỔNG TIỀN ĐÃ GIẢM (VNĐ)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discountStats && discountStats.length > 0 ? (
                discountStats.map((d, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={tableStyles.cell}>
                      {d.discountName}
                    </TableCell>
                    <TableCell sx={tableStyles.cell}>
                      {d.usageCount ?? 0}
                    </TableCell>
                    <TableCell sx={tableStyles.cell}>
                      {d.totalDiscountedAmount
                        ? new Intl.NumberFormat().format(
                            d.totalDiscountedAmount
                          )
                        : "0"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    sx={{ textAlign: "center", py: 3, color: "gray" }}
                  >
                    Chưa có dữ liệu sử dụng mã giảm giá.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
};

export default StatisticsPage;
