import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Clock, Truck, CheckCircle2 } from 'lucide-react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import URLS from '../urls';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const Adminshome = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0, pending: 0, processing: 0, delivered: 0, totalProducts: 0
  });

  // Graph states - current week
  const [weeklyLabels, setWeeklyLabels] = useState([]);
  const [salesDataPoints, setSalesDataPoints] = useState([]);
  const [orderCountDataPoints, setOrderCountDataPoints] = useState([]);

  // Graph states - previous week
  const [prevSalesDataPoints, setPrevSalesDataPoints] = useState([]);
  const [prevOrderCountDataPoints, setPrevOrderCountDataPoints] = useState([]);

  // Best Selling Products State
  const [bestSellingData, setBestSellingData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#10b981', '#3b82f6', '#f97316', '#06b6d4', '#8b5cf6'],
    }]
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(URLS.allOrders).then(res => res.json()),
      fetch(URLS.totalProductsCount).then(res => res.json())
    ])
      .then(([ordersData, productsData]) => {
        if (ordersData.success) {
          const allOrders = ordersData.data;

          // --- 1. LOGIC: Last 7 Days (Current Week) ---
          const last7Days = {};
          const dayLabels = []; // short day labels like "Mon", "Tue"
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days[dateStr] = { sales: 0, count: 0 };
            dayLabels.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
          }

          // --- 2. LOGIC: Previous 7 Days (Previous Week) ---
          const prev7Days = {};
          for (let i = 13; i >= 7; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            prev7Days[dateStr] = { sales: 0, count: 0 };
          }

          allOrders.forEach(order => {
            const orderDate = order.created_at.split('T')[0];
            if (last7Days[orderDate] !== undefined) {
              last7Days[orderDate].count += 1;
              last7Days[orderDate].sales += parseFloat(order.total_price || 0);
            }
            if (prev7Days[orderDate] !== undefined) {
              prev7Days[orderDate].count += 1;
              prev7Days[orderDate].sales += parseFloat(order.total_price || 0);
            }
          });

          const currentKeys = Object.keys(last7Days);
          const prevKeys = Object.keys(prev7Days);

          setWeeklyLabels(dayLabels);
          setSalesDataPoints(currentKeys.map(date => last7Days[date].sales));
          setOrderCountDataPoints(currentKeys.map(date => last7Days[date].count));
          setPrevSalesDataPoints(prevKeys.map(date => prev7Days[date].sales));
          setPrevOrderCountDataPoints(prevKeys.map(date => prev7Days[date].count));

          // --- 3. LOGIC: Best Selling Products ---
          const productCounts = {};
          allOrders.forEach(order => {
            if (order.products && Array.isArray(order.products)) {
              order.products.forEach(item => {
                const pName = item.name || "Unknown Product";
                const qty = item.quantity || 1;
                productCounts[pName] = (productCounts[pName] || 0) + qty;
              });
            }
          });

          const sortedProducts = Object.entries(productCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

          setBestSellingData({
            labels: sortedProducts.map(p => p[0]),
            datasets: [{
              data: sortedProducts.map(p => p[1]),
              backgroundColor: ['#10b981', '#3b82f6', '#f97316', '#06b6d4', '#8b5cf6'],
            }]
          });

          // --- 4. STATS UPDATE ---
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const weeklyOrders = allOrders.filter(o => new Date(o.created_at) >= sevenDaysAgo);

          setStats({
            totalOrders: weeklyOrders.length,
            pending: weeklyOrders.filter(o => o.status === "PENDING").length,
            processing: weeklyOrders.filter(o => ["PROCESSING", "SHIPPED"].includes(o.status)).length,
            delivered: weeklyOrders.filter(o => o.status === "DELIVERED").length,
            totalProducts: productsData.success ? productsData.total_products : 0
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
      });
  }, []);

  // Line Chart Configs with 2 lines (current week vs previous week)
  const salesChartData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: 'This Week (PKR)',
        data: salesDataPoints,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
      },
      {
        label: 'Last Week (PKR)',
        data: prevSalesDataPoints,
        borderColor: '#94a3b8',
        backgroundColor: 'rgba(148, 163, 184, 0.05)',
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        borderDash: [5, 4],
        pointRadius: 3,
        pointBackgroundColor: '#94a3b8',
      }
    ]
  };

  const ordersTrendData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: 'This Week',
        data: orderCountDataPoints,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#f97316',
      },
      {
        label: 'Last Week',
        data: prevOrderCountDataPoints,
        borderColor: '#94a3b8',
        backgroundColor: 'rgba(148, 163, 184, 0.05)',
        fill: false,
        tension: 0.3,
        borderWidth: 2,
        borderDash: [5, 4],
        pointRadius: 3,
        pointBackgroundColor: '#94a3b8',
      }
    ]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 12,
          boxHeight: 2,
          usePointStyle: true,
          pointStyle: 'line',
          font: { size: 11 },
          color: '#6b7280',
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: {
          stepSize: activeTab === 'orders' ? 1 : undefined,
          callback: function (value) {
            if (activeTab === 'sales') return 'PKR' + value.toLocaleString();
            if (value % 1 === 0) return value;
          }
        }
      },
      x: { grid: { display: false } }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    }
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Admins Dashboard</h2>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} colorClass="text-blue-600" bgColorClass="bg-blue-50" loading={loading} />
          <StatCard title="Orders Pending" value={stats.pending} icon={Clock} colorClass="text-orange-600" bgColorClass="bg-orange-50" loading={loading} />
          <StatCard title="Orders Processing" value={stats.processing} icon={Truck} colorClass="text-purple-600" bgColorClass="bg-purple-50" loading={loading} />
          <StatCard title="Orders Delivered" value={stats.delivered} icon={CheckCircle2} colorClass="text-emerald-600" bgColorClass="bg-emerald-50" loading={loading} />
          <StatCard title="Total Products" value={stats.totalProducts} icon={Package} colorClass="text-indigo-600" bgColorClass="bg-indigo-50" loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-tight">
                  {activeTab === 'sales' ? 'Weekly Sales Revenue' : 'Weekly Order Volume'}
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">This week vs last week</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('sales')}
                  className={`text-xs font-bold transition-all py-1 PKR{activeTab === 'sales' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Sales
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`text-xs font-bold transition-all py-1 PKR{activeTab === 'orders' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Orders
                </button>
              </div>
            </div>

            <div className="h-64">
              <Line
                data={activeTab === 'sales' ? salesChartData : ordersTrendData}
                options={chartOptions}
              />
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h3 className="text-sm font-bold text-gray-700 mb-6 uppercase text-center tracking-tight">Best Selling Products</h3>
            <div className="h-64 flex justify-center">
              {bestSellingData.labels.length > 0 ? (
                <Pie data={bestSellingData} options={{ maintainAspectRatio: false }} />
              ) : (
                <p className="text-gray-400 text-xs flex items-center">No sales data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass, loading }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3 h-24 hover:shadow-md transition-shadow">
    <div className={`PKR{bgColorClass} p-3 rounded-xl`}><Icon className={colorClass} size={20} /></div>
    <div className="overflow-hidden">
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider truncate">{title}</p>
      <h3 className="text-xl font-black text-gray-900 mt-0.5">{loading ? "..." : value}</h3>
    </div>
  </div>
);

export default Adminshome;
