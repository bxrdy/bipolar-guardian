
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, Dot } from "recharts";
import { useIsMobile } from '@/hooks/use-mobile';

interface ChartDataPoint {
  date: string;
  formattedDate: string;
  steps: number;
  sleepHours: number;
  riskLevel: 'green' | 'amber' | 'red' | null;
  riskColor: string;
}

interface SevenDayTrendChartProps {
  chartData: ChartDataPoint[];
  hasData: boolean;
}

const chartConfig = {
  steps: {
    label: "Steps",
    color: "#3b82f6",
  },
  sleepHours: {
    label: "Sleep Hours",
    color: "#8b5cf6",
  },
};

// Custom dot component for risk levels
const RiskDot = (props: { cx?: number; cy?: number; payload?: ChartDataPoint }) => {
  const { cx, cy, payload } = props;
  if (!payload?.riskLevel) return null;
  
  return (
    <Dot 
      cx={cx} 
      cy={cy} 
      r={4} 
      fill={payload.riskColor}
      stroke="#fff"
      strokeWidth={2}
    />
  );
};

const SevenDayTrendChart = ({ chartData, hasData }: SevenDayTrendChartProps) => {
  const isMobile = useIsMobile();
  console.log('SevenDayTrendChart rendering with:', { chartData, hasData });

  if (!hasData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">7-Day Trends</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500 py-8">
            <div className="text-gray-400 mb-2">📊</div>
            <p>No trend data available yet</p>
            <p className="text-sm mt-1">Data will appear as you track your daily activities</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Normalize data for dual-axis display
  const maxSteps = Math.max(...chartData.map(d => d.steps));
  const maxSleep = Math.max(...chartData.map(d => d.sleepHours));
  
  const normalizedData = chartData.map(point => ({
    ...point,
    stepsNormalized: maxSteps > 0 ? (point.steps / maxSteps) * 10 : 0, // Scale to 0-10 range
    sleepHours: point.sleepHours,
    // Format date for mobile - use shorter format
    displayDate: isMobile 
      ? new Date(point.date + 'T00:00:00.000Z').toLocaleDateString('en-US', { 
          weekday: 'short', 
          day: 'numeric' 
        })
      : point.formattedDate
  }));

  console.log('Chart normalized data:', normalizedData);

  return (
    <Card>
      <CardHeader className={isMobile ? "pb-4" : ""}>
        <CardTitle className="text-lg font-semibold">
          7-Day Trends
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? "p-3" : "p-4"}>
        <ChartContainer config={chartConfig} className={isMobile ? "h-56 w-full" : "h-64 w-full"}>
          <LineChart 
            width={isMobile ? 300 : 739}
            height={isMobile ? 224 : 256}
            data={normalizedData} 
            margin={isMobile 
              ? { top: 10, right: 15, left: 10, bottom: 10 } 
              : { top: 20, right: 30, left: 20, bottom: 20 }
            }
            >
              <XAxis 
                dataKey={isMobile ? "displayDate" : "formattedDate"}
                axisLine={false}
                tickLine={false}
                fontSize={isMobile ? 10 : 12}
                className="text-gray-600"
                interval={isMobile ? 0 : "preserveStartEnd"}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 50 : 30}
              />
              <YAxis 
                yAxisId="sleep"
                orientation="left"
                axisLine={false}
                tickLine={false}
                fontSize={isMobile ? 10 : 12}
                className="text-gray-600"
                domain={[0, Math.max(8, maxSleep + 1)]}
                width={isMobile ? 25 : 40}
              />
              <YAxis 
                yAxisId="steps"
                orientation="right" 
                axisLine={false}
                tickLine={false}
                fontSize={isMobile ? 10 : 12}
                className="text-gray-600"
                domain={[0, 10]}
                width={isMobile ? 25 : 40}
                tickFormatter={(value) => {
                  const actualSteps = Math.round((value / 10) * maxSteps);
                  return actualSteps > 999 ? `${(actualSteps / 1000).toFixed(0)}k` : actualSteps.toString();
                }}
              />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  
                  const data = payload[0]?.payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
                      <p className="font-medium text-gray-900 mb-2 text-sm">{data?.formattedDate}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-purple-600">Sleep:</span>
                          <span className="font-medium">{data?.sleepHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-blue-600">Steps:</span>
                          <span className="font-medium">{data?.steps.toLocaleString()}</span>
                        </div>
                        {data?.riskLevel && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Risk:</span>
                            <span 
                              className="font-medium capitalize"
                              style={{ color: data.riskColor }}
                            >
                              {data.riskLevel}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
              
              <Line
                yAxisId="sleep"
                type="monotone"
                dataKey="sleepHours"
                stroke={chartConfig.sleepHours.color}
                strokeWidth={isMobile ? 1.5 : 2}
                dot={false}
                activeDot={{ r: isMobile ? 3 : 4, fill: chartConfig.sleepHours.color }}
              />
              
              <Line
                yAxisId="steps"
                type="monotone"
                dataKey="stepsNormalized"
                stroke={chartConfig.steps.color}
                strokeWidth={isMobile ? 1.5 : 2}
                dot={<RiskDot />}
                activeDot={{ r: isMobile ? 3 : 4, fill: chartConfig.steps.color }}
              />
            </LineChart>
        </ChartContainer>
        
        {/* Legend with improved responsive spacing */}
        <div className={`flex flex-wrap items-center justify-center mt-4 gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm`}>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: chartConfig.sleepHours.color }}></div>
            <span className="whitespace-nowrap">Sleep Hours</span>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: chartConfig.steps.color }}></div>
            <span className="whitespace-nowrap">Steps</span>
          </div>
          {chartData.some(d => d.riskLevel) && (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-400 flex-shrink-0"></div>
              <span className="whitespace-nowrap">Risk Level</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SevenDayTrendChart;
