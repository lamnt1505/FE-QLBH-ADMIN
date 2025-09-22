import React, { useEffect, useState } from "react";
import axios from "axios";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";

const Dashboard = () => {

  const [yearlyData, setYearlyData] = useState([]);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchYearlyData();
    fetchSalesData();
  }, []);

  const fetchYearlyData = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/product/yearly");
      setYearlyData(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu theo năm:", err);
    }
  };

  const fetchSalesData = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/product/sales");
      setSalesData(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu theo sản phẩm:", err);
    }
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
    series: [
      { name: "Số Lượng Đơn Hàng", data: [120, 180] },
    ],
  };

  const salesOptions = {
    chart: { type: "pie" },
    title: { text: "" },
    tooltip: { pointFormat: "{series.name}: <b>{point.y}</b>" },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: { enabled: true, format: "<b>{point.name}</b>: {point.percentage:.1f} %" },
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

  return (
    <Box sx={{ p: 3, mt: 8, width: "100%" }}>
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ height: 500, width: "100%" }}>
          <CardContent sx={{ height: "100%", width: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Thống Kê Đơn Hàng Hàng Năm
            </Typography>
            <Box sx={{ height: "90%", width: "100%" }}>
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
        <Card sx={{ height: 500, width: "100%" }}>
          <CardContent sx={{ height: "100%", width: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Nguồn doanh thu
            </Typography>
            <Box sx={{ height: "90%", width: "100%" }}>
              <HighchartsReact
                highcharts={Highcharts}
                options={salesOptions}
                containerProps={{ style: { height: "100%", width: "100%" } }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
  );
}

export default Dashboard;
