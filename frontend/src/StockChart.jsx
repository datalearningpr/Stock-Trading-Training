import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import * as echarts from "echarts";

const upColor = "#00da3c";
const downColor = "#ec0000";

const StockChart = ({ data, buyPoints, sellPoints }) => {
  const chartRef = useRef();
  const chartInstanceRef = useRef(null);

  function splitData(rawData) {
    let categoryData = [];
    let values = [];
    let volumes = [];
    for (let i = 0; i < rawData.length; i++) {
      categoryData.push(rawData[i].x);
      values.push([rawData[i].o, rawData[i].c, rawData[i].l, rawData[i].h]);
      volumes.push([i, rawData[i].v, rawData[i].o > rawData[i].c ? 1 : -1]);
    }
    return {
      categoryData: categoryData,
      values: values,
      volumes: volumes,
    };
  }

  function calculateMA(dayCount, data) {
    var result = [];
    for (var i = 0, len = data.values.length; i < len; i++) {
      if (i < dayCount) {
        result.push("-");
        continue;
      }
      var sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += data.values[i - j][1];
      }
      result.push((sum / dayCount).toFixed(3));
    }
    return result;
  }

  useEffect(() => {
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    const processedData = splitData(data.prices);
    const ma5 = calculateMA(5, processedData);
    const ma10 = calculateMA(10, processedData);
    const ma20 = calculateMA(20, processedData);
    const ma30 = calculateMA(30, processedData);

    const option = {
      animation: false,
      legend: {
        bottom: 10,
        left: "center",
        data: ["Stock price", "MA5", "MA10", "MA20", "MA30"],
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        textStyle: {
          color: "#000",
        },
        position: function (pos, params, el, elRect, size) {
          const obj = {
            top: 10,
          };
          obj[["left", "right"][+(pos[0] < size.viewSize[0] / 2)]] = 30;
          return obj;
        },
      },
      axisPointer: {
        link: [
          {
            xAxisIndex: "all",
          },
        ],
        label: {
          backgroundColor: "#777",
        },
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: false,
          },
          brush: {
            type: ["lineX", "clear"],
          },
        },
      },
      brush: {
        xAxisIndex: "all",
        brushLink: "all",
        outOfBrush: {
          colorAlpha: 0.1,
        },
      },
      visualMap: {
        show: false,
        seriesIndex: 5,
        dimension: 2,
        pieces: [
          {
            value: 1,
            color: downColor,
          },
          {
            value: -1,
            color: upColor,
          },
        ],
      },
      grid: [
        {
          left: "10%",
          right: "8%",
          height: "50%",
        },
        {
          left: "10%",
          right: "8%",
          top: "63%",
          height: "16%",
        },
      ],
      xAxis: [
        {
          type: "category",
          data: processedData.categoryData,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          min: "dataMin",
          max: "dataMax",
          axisPointer: {
            z: 100,
          },
        },
        {
          type: "category",
          gridIndex: 1,
          data: processedData.categoryData,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          min: "dataMin",
          max: "dataMax",
        },
      ],
      yAxis: [
        {
          scale: true,
          splitArea: {
            show: true,
          },
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0, 1],
          start: 0,
          end: 100,
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: "slider",
          top: "85%",
          start: 0,
          end: 100,
        },
      ],
      series: [
        {
          name: "Stock price",
          type: "candlestick",
          data: processedData.values,
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: undefined,
            borderColor0: undefined,
          },
        },
        {
          name: "MA5",
          type: "line",
          data: ma5,
          smooth: true,
          lineStyle: {
            opacity: 0.5,
          },
        },
        {
          name: "MA10",
          type: "line",
          data: ma10,
          smooth: true,
          lineStyle: {
            opacity: 0.5,
          },
        },
        {
          name: "MA20",
          type: "line",
          data: ma20,
          smooth: true,
          lineStyle: {
            opacity: 0.5,
          },
        },
        {
          name: "MA30",
          type: "line",
          data: ma30,
          smooth: true,
          lineStyle: {
            opacity: 0.5,
          },
        },
        {
          name: "Volume",
          type: "bar",
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: processedData.volumes,
          itemStyle: {
            color: "#7f7f7f",
          },
        },
        {
          type: "scatter",
          data: buyPoints
            .map(([x, y]) => {
              const dayData = data.prices.find((item) => item.x === x);
              return {
                value: [x, dayData ? dayData.l : y],
                symbolOffset: [0, 7],
              };
            }),
          symbol: "triangle",
          symbolSize: 15,
          itemStyle: {
            color: "rgba(235, 135, 21, 1)",
          },
          z: 10,
        },
        {
          type: "scatter",
          data: sellPoints
            .map(([x, y]) => {
              const dayData = data.prices.find((item) => item.x === x);
              return {
                value: [x, dayData ? dayData.h : y],
                symbolOffset: [0, -7],
              };
            }),
          symbol: "triangle",
          symbolSize: 15,
          symbolRotate: 180,
          itemStyle: {
            color: "rgba(52, 152, 219, 1)",
          },
          z: 10,
        },
      ],
    };

    chartInstanceRef.current.setOption(option);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [data, buyPoints, sellPoints]);

  return (
    <div ref={chartRef} style={{ width: "100%", height: "650px" }} />
  );
};

StockChart.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    prices: PropTypes.arrayOf(
      PropTypes.shape({
        x: PropTypes.string.isRequired,
        o: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired,
        l: PropTypes.number.isRequired,
        c: PropTypes.number.isRequired,
        v: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
  buyPoints: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))
  ).isRequired,
  sellPoints: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))
  ).isRequired,
};

export default StockChart;
