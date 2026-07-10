const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/"
).replace(/\/+$/, "");
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
  createCategory: `${BASE_URL}/products/categories/create/`,
  createSubcategory: `${BASE_URL}/products/subcategories/create/`,
  linkCategorySubcategory: `${BASE_URL}/products/link-category-subcategory/`,
  deleteCategory: (id) => `${BASE_URL}/products/categories/${id}/delete/`,
  deleteSubcategory: (id) => `${BASE_URL}/products/subcategories/${id}/delete/`,
  fetchAllSubcategories: `${BASE_URL}/products/subcategories/all/`,
  fetchSubcategories: (catId) => `${BASE_URL}/products/subcategories/${catId}/`,

  // Orders & Dashboard
  allOrders: `${BASE_URL}/all-orders/`,
  createOrder: `${BASE_URL}/orders/create/`,
  orderDetail: (id) => `${BASE_URL}/orders/${id}/`,
  updateOrderStatus: (id) => `${BASE_URL}/orders/${id}/update_status/`,
  getProductBySku: (sku) => `${BASE_URL}/products/product-by-sku/${sku}/`,
  updateStock: (id) => `${BASE_URL}/products/update-stock/${id}/`,
  pages: `${BASE_URL}/products/pages/`,
  pageDetail: (id) => `${BASE_URL}/products/pages/${id}/`,
  pageBySlug: (slug) => `${BASE_URL}/products/pages/slug/${slug}/`,
  headerPages: `${BASE_URL}/products/header-pages/`,
  headerGroups: `${BASE_URL}/products/header-groups/`,
  headerGroupDetail: (id) => `${BASE_URL}/products/header-groups/${id}/`,
  headerNav: `${BASE_URL}/products/header-nav/`,


  // Others
  announcement: `${BASE_URL}/products/manage_announcement/`,
  createPayment: `${BASE_URL}/products/create-payment/`,
  // Authentication
  signup: `${BASE_URL}/signup/`,
  signin: `${BASE_URL}/signin/`,
  GOOGLE_LOGIN: `${BASE_URL}/google-login/`,

  manageAnnouncement: `${BASE_URL}/products/manage_announcement/`,
  updateSlider: `${BASE_URL}/products/update-slider/`,
  // Users & Roles
  getAllUsers: `${BASE_URL}/getallusers/`,
  getRoles: `${BASE_URL}/roles/`,
  updateUserRole: (userId) => `${BASE_URL}/update-role/${userId}/`,
  deleteUser: (id) => `${BASE_URL}/delete-user/${id}/`,
  deleteOrder: (id) => `${BASE_URL}/orders/delete/${id}/`,
fetchSubSubCategories: (subcategoryId) => `${BASE_URL}/products/sub-subcategories/by-subcategory/${subcategoryId}/`,
createSubSubCategory: `${BASE_URL}/products/sub-subcategories/create/`,
linkSubCategorySubSubCategory: `${BASE_URL}/products/sub-subcategories/link/`,

};

export default URLS;
