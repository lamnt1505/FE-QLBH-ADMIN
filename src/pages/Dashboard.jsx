import React, { useEffect, useState } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import API_BASE_URL from "../config/config.js";

const Dashboard = () => {
  const [yearlyData, setYearlyData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [dailyRevenueStatus, setDailyRevenueStatus] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);

  useEffect(() => {
    fetchYearlyData();
    fetchSalesData();
    fetchRevenueData();
    fetchDailyRevenueStatus();
    fetchPaymentStatistics();
  }, []);

  const fetchPaymentStatistics = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/payment-method`);
      setPaymentStats(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy thống kê phương thức thanh toán:", err);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/export/revenue-by-month`
      );
      setRevenueData(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu doanh thu:", err);
    }
  };

  const fetchYearlyData = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/product/yearly`
      );
      setYearlyData(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu theo năm:", err);
    }
  };

  const fetchSalesData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/product/sales`);
      setSalesData(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu theo sản phẩm:", err);
    }
  };

  const fetchDailyRevenueStatus = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/export/revenue-by-day-status`
      );
      setDailyRevenueStatus(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy doanh thu theo ngày (theo trạng thái):", err);
    }
  };

  const paymentMethodOptions = {
    chart: { type: "pie" },
    title: { text: "" },
    tooltip: { pointFormat: "{series.name}: <b>{point.y}</b>" },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: {point.percentage:.1f} %",
        },
      },
    },
    series: [
      {
        name: "Số đơn hàng",
        colorByPoint: true,
        data: paymentStats.map((item) => ({
          name:
            item.paymentMethod === "VNPAY"
              ? "Thanh toán VNPAY"
              : item.paymentMethod === "COD"
              ? "Thanh toán khi nhận hàng (COD)"
              : item.paymentMethod || "Khác",
          y: item.total,
        })),
      },
    ],
  };

  const yearlyOptions = {
    chart: { type: "line" },
    title: { text: "" },
    xAxis: {
      categories: ["2024", "2025"],
      title: { text: "Năm" },
    },
    yAxis: {
      title: { text: "Số Lượng Đơn Hàng" },
    },
    series: [{ name: "Số Lượng Đơn Hàng", data: [120, 180] }],
  };

  const salesOptions = {
    chart: { type: "pie" },
    title: { text: "" },
    tooltip: { pointFormat: "{series.name}: <b>{point.y}</b>" },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: {point.percentage:.1f} %",
        },
      },
    },
    series: [
      {
        name: "Doanh thu",
        colorByPoint: true,
        data: [
          { name: "MACBOOK PRO M2 - 256GB", y: 45 },
          { name: "Dell Precision 7530", y: 10 },
          { name: "HP Elitebook", y: 20 },
          { name: "Khác", y: 25 },
        ],
      },
    ],
  };

  const revenueOptions = {
    chart: { type: "column" },
    title: { text: "" },
    xAxis: {
      categories: revenueData.map((item) => item.month),
      title: { text: "Tháng" },
    },
    yAxis: {
      min: 0,
      title: { text: "Doanh thu (VNĐ)" },
    },
    tooltip: {
      pointFormat: "Doanh thu: <b>{point.y:,.0f} VND</b>",
    },
    series: [
      {
        name: "Doanh thu",
        data: revenueData.map((item) => item.revenue),
        color: "#4f46e5",
      },
    ],
  };

  const dailyRevenueStatusOptions = {
    chart: { type: "line" },
    title: { text: "" },
    xAxis: {
      categories: [...new Set(dailyRevenueStatus.map((item) => item.day))],
      title: { text: "Ngày" },
    },
    yAxis: {
      title: { text: "Doanh thu (VNĐ)" },
    },
    tooltip: {
      shared: true,
      valueSuffix: " VND",
    },
    series: ["Hoàn thành", "Chờ duyệt"].map((status) => ({
      name: status,
      data: [...new Set(dailyRevenueStatus.map((item) => item.day))].map(
        (day) => {
          const record = dailyRevenueStatus.find(
            (d) => d.day === day && d.status === status
          );
          return record ? record.revenue : 0;
        }
      ),
    })),
  };

  return (
    <Box sx={{ p: 3, mt: 8, width: "100%" }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              minHeight: 400,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Typography variant="h6" gutterBottom>
                THỐNG KÊ ĐƠN HÀNG THEO NĂM
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={yearlyOptions}
                  containerProps={{ style: { height: "100%", width: "100%" } }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ minHeight: 400, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                THỐNG KÊ THEO PHƯƠNG THỨC THANH TOÁN
              </Typography>
              <HighchartsReact
                highcharts={Highcharts}
                options={paymentMethodOptions}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: "100%",
              minHeight: 400,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Typography variant="h6" gutterBottom>
                NGUỒN DOANH THU
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={salesOptions}
                  containerProps={{ style: { height: "100%", width: "100%" } }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Card
            sx={{
              height: "100%",
              minHeight: 400,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Typography variant="h6" gutterBottom>
                DOANH THU THEO THÁNG
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={revenueOptions}
                  containerProps={{ style: { height: "100%", width: "100%" } }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Card
            sx={{
              height: "100%",
              minHeight: 400,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Typography variant="h6" gutterBottom>
                DOANH THU THEO NGÀY (PHÂN THEO TRẠNG THÁI)
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={dailyRevenueStatusOptions}
                  containerProps={{ style: { height: "100%", width: "100%" } }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
