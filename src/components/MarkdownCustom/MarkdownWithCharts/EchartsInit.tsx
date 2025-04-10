// echarts的通用组件
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
interface MarkDownEchartsProps {
    options: echarts.EChartsOption;
}

const MarkDownEcharts: React.FC<MarkDownEchartsProps> = ({ options }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (chartRef.current) {
            const chart = echarts.init(chartRef.current);
            requestAnimationFrame(() => {
                chart.setOption(options);
            });
            
            return () => {
                chart.dispose();
            };
        }
    }, [options]);
    try {
        return <div ref={chartRef} className="w-[600px] h-[400px]" />;
    } catch (error) {
        return <div>Error parsing chart data: {(error as Error).message}</div>;
    }
}

export default MarkDownEcharts;
