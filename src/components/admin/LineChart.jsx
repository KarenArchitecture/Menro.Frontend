import React, { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
);

export default function LineChart({ labels, datasetLabel, data, colorConfig }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, colorConfig.gradientStart);
    gradient.addColorStop(1, colorConfig.gradientEnd);

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: datasetLabel,
            data,
            backgroundColor: gradient,
            borderColor: colorConfig.borderColor,
            borderWidth: 3,
            fill: true,
            pointBackgroundColor: "#FFFFFF",
            pointBorderColor: colorConfig.borderColor,
            pointHoverRadius: 7,
            pointRadius: 5,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: "#888" },
            grid: { color: "#2f2f2f" },
          },
          x: { ticks: { color: "#888" }, grid: { display: false } },
        },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: "#1E1E1E", padding: 10, cornerRadius: 8 },
        },
      },
    });

    chartRef.current = chart;

    // Resize when parent size changes (after CSS injection/tab switch/etc.)
    const ro = new ResizeObserver(() => {
      chart.resize();
    });
    ro.observe(canvasRef.current.parentElement);

    // Nudge once after mount to catch late style injection
    setTimeout(() => chart.resize(), 0);

    return () => {
      ro.disconnect();
      chart.destroy();
      chartRef.current = null;
    };
  }, [labels, datasetLabel, data, colorConfig]);

  return <canvas ref={canvasRef} className="chart-canvas" />;
}
