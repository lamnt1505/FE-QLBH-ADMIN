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
  Avatar,
  Select,
  MenuItem,
  Button,
  TablePagination
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const accountData = JSON.parse(localStorage.getItem("account"));
  const currentRole = accountData?.role?.toUpperCase();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  console.log("Current Role:", currentRole);
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/v1/account/Listgetall"
      );
      setAccounts(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách tài khoản:", err);
      toast.error("Lỗi khi lấy danh sách tài khoản");
    }
  };

  const handleRoleChange = async (accountID, newRole) => {
    try {
      await axios.put(
        `http://localhost:8080/api/v1/account/grant-role/${accountID}?role=${newRole}`,
        {},
        {
          headers: {
            "X-Role": "ADMIN",
          },
        }
      );
      toast.success(`Đã phân quyền thành ${newRole}`);
      fetchAccounts();
    } catch (err) {
      console.error("Lỗi khi phân quyền:", err);
      toast.error("Không thể phân quyền");
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedAccounts = accounts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3, mt: 10 }}>
      <Typography variant="h5" gutterBottom>
        DANH SÁCH TÀI KHOẢN
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>ID</b>
              </TableCell>
              <TableCell>
                <b>ẢNH</b>
              </TableCell>
              <TableCell>
                <b>TÊN TÀI KHOẢN</b>
              </TableCell>
              <TableCell>
                <b>USERNAME</b>
              </TableCell>
              <TableCell>
                <b>E-MAIL</b>
              </TableCell>
              <TableCell>
                <b>PHONE</b>
              </TableCell>
              <TableCell>
                <b>ĐỊA CHỈ</b>
              </TableCell>
              <TableCell>
                <b>NGÀY SINH</b>
              </TableCell>
              <TableCell>
                <b>ROLE</b>
              </TableCell>
              <TableCell>
                <b>PHÂN QUYỀN</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAccounts.length > 0 ? (
              paginatedAccounts.map((acc) => (
                <TableRow key={acc.accountID}>
                  <TableCell>{acc.accountID}</TableCell>
                  <TableCell>
                    {acc.imageBase64 ? (
                      <Avatar
                        alt={acc.accountName}
                        src={`data:image/png;base64,${acc.imageBase64}`}
                      />
                    ) : (
                      <Avatar>{acc.accountName?.[0]}</Avatar>
                    )}
                  </TableCell>
                  <TableCell>{acc.accountName}</TableCell>
                  <TableCell>{acc.username}</TableCell>
                  <TableCell>{acc.email}</TableCell>
                  <TableCell>{acc.phoneNumber}</TableCell>
                  <TableCell>{acc.local}</TableCell>
                  <TableCell>{acc.dateOfBirth}</TableCell>
                  <TableCell>{acc.admin ? "✅" : "❌"}</TableCell>
                  {currentRole === "ADMIN" && (
                    <>
                      <TableCell>
                        <Select
                          value={acc.typeAccount || "USER"}
                          onChange={(e) =>
                            handleRoleChange(acc.accountID, e.target.value)
                          }
                          size="small"
                        >
                          <MenuItem value="USER">USER</MenuItem>
                          <MenuItem value="EMPLOYEE">EMPLOYEE</MenuItem>
                          <MenuItem value="ADMIN">ADMIN</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            handleRoleChange(acc.accountID, acc.typeAccount)
                          }
                        >
                          Lưu
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Không có tài khoản nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={accounts.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số dòng mỗi trang:"
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
      />
    </Box>
  );
};

export default AccountList;
