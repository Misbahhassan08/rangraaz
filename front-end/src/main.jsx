import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Home from "./Pages/Home.jsx";
import Cart from "./pages/Cart.jsx";
import Allproducts from "./pages/Allproducts.jsx";
import Productdetail from "./pages/Productdetail.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";
import DashboardLayout from "./DashboardLayout.jsx";
import Adminshome from "./pages/Adminshome.jsx";
import Adminproducts from "./pages/Adminproducts.jsx";
import Orders from "./pages/Orders.jsx";
import Users from "./pages/Users.jsx";
import OrderDetail from "./pages/Orderdetail.jsx";
import Trackingpage from "./pages/Trackingpage.jsx";
import ManageSlider from "./pages/Manageslider.jsx";
import Sale from "./pages/Sale.jsx";
import Barcodemanager from "./pages/Barcodemanager.jsx";
import Favorites from "./pages/Favorites.jsx";
import SizeDrawer from "./pages/SizeDrawer.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import QuickSearch from "./pages/QuickSearch.jsx"
const CLIENT_ID = "897625668141-c53cp1fdekd0du1l21k22jm9qg637912.apps.googleusercontent.com"; 


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "/cart", element: <Cart /> },
      { path: "/allproducts", element: <Allproducts /> },
      { path: "/sale", element: <Sale /> },
      { path: "/productdetail", element: <Productdetail /> },
      { path: "/checkout", element: <Checkout /> },
      { path: "/login", element: <Login /> },
        { path: "/favorites", element: <Favorites /> },
        { path: "/sizedrawer", element: <SizeDrawer /> },
    ],
  },
  {

    path: "/dashboard",
     element: (
    <PrivateRoute adminOnly={true}>   
      <DashboardLayout />
    </PrivateRoute>
  ),
    children: [
      { index: true, element: <Adminshome /> },
      { path: "products", element: <Adminproducts /> },
      { path: "orders", element: <Orders /> },
      { path: "orders/:id", element: <OrderDetail /> },
      { path: "users", element: <Users /> },
      { path: "tracking", element: <Trackingpage /> },
      { path: "manage-slider", element: <ManageSlider /> },
      { path: "barcode-manager", element: <Barcodemanager /> },
      {path:"/dashboard/pos", element:<QuickSearch />} 






    ],
  }
]);

const root = document.getElementById("root");

createRoot(root).render(
  <GoogleOAuthProvider clientId={CLIENT_ID}>
    <RouterProvider router={router} />
  </GoogleOAuthProvider>
);