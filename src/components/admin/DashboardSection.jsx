import { useEffect, useState } from "react";
import Panel from "./Panel";
import LineChart from "./LineChart";
import adminDashboardAxios from "../../api/adminDashboardAxios";

export default function DashboardSection() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await adminDashboardAxios.get("/dashboard");
        setDashboardData(data);
      } catch (err) {
        console.error("خطا در دریافت داده داشبورد:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const formatTomans = (n) =>
    (Number(n) || 0).toLocaleString("fa-IR") + " تومان";

  const labels = dashboardData?.monthlySales?.map((x) => x.monthName) ?? [];
  const data =
    dashboardData?.monthlySales?.map((x) => Number(x.totalSales)) ?? [];

  if (loading) return <div className="loading">در حال بارگذاری...</div>;

  return (
    <section>
      <h2 className="content-title">نمای کلی</h2>

      <div className="panels-section">
        <div className="top-panel">
          <Panel title="درآمد کل" className="summary-panel">
            <div
              style={{
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <i
                className="fas fa-dollar-sign"
                style={{ color: "#f59e0b", fontSize: 22 }}
              />
              <div>
                <div style={{ opacity: 0.85, fontSize: 14 }}>جمع درآمد</div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>
                  {formatTomans(dashboardData?.totalRevenue)}
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="آمار امروز" className="today-panel">
            <div
              className="today-stats-box"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div
                className="today-stat"
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <i
                  className="fas fa-shopping-basket"
                  style={{ color: "#10b981", fontSize: 22 }}
                />
                <div>
                  <div style={{ opacity: 0.8, fontSize: 14 }}>
                    تعداد سفارش‌های امروز
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>
                    {dashboardData?.todayOrdersCount?.toLocaleString("fa-IR")}
                  </div>
                </div>
              </div>

              <div
                className="today-stat"
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <i
                  className="fas fa-coins"
                  style={{ color: "#f59e0b", fontSize: 22 }}
                />
                <div>
                  <div style={{ opacity: 0.8, fontSize: 14 }}>درآمد امروز</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>
                    {formatTomans(dashboardData?.todayRevenue)}
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <Panel
          title="نمودار فروش ماهانه"
          className="chart-panel"
          style={{ gridColumn: "1 / -1" }}
        >
          <div className="chart-container">
            <LineChart
              labels={labels}
              datasetLabel="فروش (تومان)"
              data={data}
              colorConfig={{
                borderColor: "#F59E0B",
                gradientStart: "rgba(245,158,11,0.4)",
                gradientEnd: "rgba(245,158,11,0)",
              }}
            />
          </div>
        </Panel>
      </div>
    </section>
  );
}
