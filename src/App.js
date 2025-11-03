import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Trademarks from "./pages/Trademarks";
import AddProduct from "./pages/AddProduct";
import ProductVotePage from "./pages/ProductVotePage";
import Statisticals from "./pages/Statistical";
import OrderSummaryPages from "./pages/OrderSummaryPage";
import CreateDiscountPage from "./pages/CreateDiscountPage";
import AccountList from "./pages/AccountList";
import StorageList from "./pages/StorageList";
import StorageForm from "./pages/StorageForm";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import DiscountList from "./pages/DiscountList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Mặc định "/" => /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        {/* Trang login KHÔNG có layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/discountslist" element={<DiscountList />} />
            <Route path="/products" element={<Products />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/trademarks" element={<Trademarks />} />
            <Route path="/statisticals" element={<Statisticals />} />
            <Route path="/orders" element={<OrderSummaryPages />} />
            <Route path="/votes" element={<ProductVotePage />} />
            <Route path="/add-discounts" element={<CreateDiscountPage />} />
            <Route path="/accounts" element={<AccountList />} />
            <Route path="/storages" element={<StorageList />} />
            <Route path="/add-storage" element={<StorageForm />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
