const BASE_URL = "http://127.0.0.1:8000";

const URLS = {
  // Products
  fetchProducts: `${BASE_URL}/products/products/`,
  createProduct: `${BASE_URL}/products/products/create/`,
  updateProduct: (id) => `${BASE_URL}/products/products/${id}/update/`,
  deleteProduct: (id) => `${BASE_URL}/products/products/${id}/delete/`,
  totalProductsCount: `${BASE_URL}/products/total-products/`,
  fetchSlider: `${BASE_URL}/products/get-slider/`,
  saleProducts: `${BASE_URL}/products/sale-items/`,
  updateOrderShipment: (id) => `${BASE_URL}/orders/${id}/update-shipment/`,

  // Categories & Subcategories
  fetchCategories: `${BASE_URL}/products/categories/all/`,
  fetchSubcategories: (catId) => `${BASE_URL}/products/subcategories/${catId}/`,

  // Orders & Dashboard
  allOrders: `${BASE_URL}/all-orders/`,
  createOrder: `${BASE_URL}/orders/create/`,
  orderDetail: (id) => `${BASE_URL}/orders/${id}/`,
  updateOrderStatus: (id) => `${BASE_URL}/orders/${id}/update_status/`,

  // Others
  announcement: `${BASE_URL}/products/manage_announcement/`,
  createPayment: `${BASE_URL}/products/create-payment/`,
  // Authentication
  signup: `${BASE_URL}/signup/`,
  signin: `${BASE_URL}/signin/`,
  manageAnnouncement: `${BASE_URL}/products/manage_announcement/`,
  updateSlider: `${BASE_URL}/products/update-slider/`,
  // Users & Roles
  getAllUsers: `${BASE_URL}/getallusers/`,
  getRoles: `${BASE_URL}/roles/`,
  updateUserRole: (userId) => `${BASE_URL}/update-role/${userId}/`,

  

};

export default URLS;