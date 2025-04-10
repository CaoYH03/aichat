import MarkDownEcharts from './EchartsInit';
// 自定义代码块渲染组件
// 定义代码块属性接口
interface MarkdownWithChartsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node: Element | any;
    inline?: boolean;
    className?: string;
    children: React.ReactNode;
}
const MarkdownWithCharts: React.FC<MarkdownWithChartsProps> = ({ className, children, ...props }) => {
    const isEcharts = className?.includes('eo-echarts-json');
    // 检查是否是我们定义的特殊代码块类型
    if (isEcharts) {
      return <MarkDownEcharts options={JSON.parse(String(children).replace(/\n$/, ''))} />;
    }
    
    // 对于其他代码块类型，使用默认渲染
    return (
      <pre className={className} {...props}>
        <code>{children}</code>
      </pre>
    );
  };
  export default MarkdownWithCharts;