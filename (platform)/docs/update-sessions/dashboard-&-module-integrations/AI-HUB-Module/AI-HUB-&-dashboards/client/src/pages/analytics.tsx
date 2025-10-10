import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, BarChart3, Activity, Clock, Zap, AlertTriangle, DollarSign } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TIME_RANGES = [
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "1y", label: "1 Year" }
];

const COLORS = ['#00D2FF', '#39FF14', '#A855F7', '#F59E0B', '#EF4444'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: executionMetrics, isLoading: loadingExecution } = useQuery({
    queryKey: ['/api/analytics/executions'],
  });

  const { data: agentMetrics, isLoading: loadingAgents } = useQuery({
    queryKey: ['/api/analytics/agents'],
  });

  const { data: costMetrics, isLoading: loadingCosts } = useQuery({
    queryKey: ['/api/analytics/costs'],
  });

  const pieData = executionMetrics ? [
    { name: 'Successful', value: (executionMetrics as any).successfulExecutions, color: '#39FF14' },
    { name: 'Failed', value: (executionMetrics as any).failedExecutions, color: '#EF4444' },
  ] : [];

  return (
    <div className="space-y-6" data-testid="analytics-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neon-text" data-testid="page-title">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor workflow performance and system metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.id} value={range.id}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card hover:border-primary/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-neon-green">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12%
                </div>
              </div>
            </div>
            <p className="text-2xl font-bold mb-1" data-testid="metric-total-executions">
              {loadingExecution ? '--' : (executionMetrics as any)?.totalExecutions?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-muted-foreground">Total Executions</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:border-neon-green/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-neon-green/10">
                <Zap className="w-5 h-5 text-neon-green" />
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-neon-green">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3.2%
                </div>
              </div>
            </div>
            <p className="text-2xl font-bold mb-1" data-testid="metric-success-rate">
              {loadingExecution ? '--' : `${((executionMetrics as any)?.successRate || 0).toFixed(1)}%`}
            </p>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:border-chart-4/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-chart-4/10">
                <Clock className="w-5 h-5 text-chart-4" />
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-neon-green">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -15%
                </div>
              </div>
            </div>
            <p className="text-2xl font-bold mb-1" data-testid="metric-avg-time">
              {loadingExecution ? '--' : (executionMetrics as any)?.averageDuration > 0 ? `${((executionMetrics as any).averageDuration / 1000).toFixed(1)}s` : '--'}
            </p>
            <p className="text-sm text-muted-foreground">Avg Duration</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:border-destructive/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-destructive">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2
                </div>
              </div>
            </div>
            <p className="text-2xl font-bold mb-1" data-testid="metric-failed-executions">
              {loadingExecution ? '--' : (executionMetrics as any)?.failedExecutions || 0}
            </p>
            <p className="text-sm text-muted-foreground">Failed Executions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Success vs Failure Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingExecution ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pieData.length > 0 && pieData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">No execution data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAgents ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : agentMetrics && Array.isArray(agentMetrics) && agentMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={agentMetrics.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="agentName" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="totalExecutions" fill="#00D2FF" name="Total Executions" />
                  <Bar dataKey="successfulExecutions" fill="#39FF14" name="Successful" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">No agent data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Cost Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                <span className="text-sm font-medium">Total Tokens Used</span>
                <span className="text-lg font-bold text-primary" data-testid="total-tokens">
                  {loadingCosts ? '--' : (costMetrics as any)?.totalTokens?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                <span className="text-sm font-medium">Estimated Cost</span>
                <span className="text-lg font-bold text-neon-green" data-testid="total-cost">
                  {loadingCosts ? '--' : `$${((costMetrics as any)?.totalCost || 0).toFixed(4)}`}
                </span>
              </div>
              
              {!loadingCosts && costMetrics && Array.isArray((costMetrics as any)?.costByModel) && (costMetrics as any).costByModel.length > 0 ? (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Cost by Model</h4>
                  <div className="space-y-2">
                    {(costMetrics as any).costByModel.map((model: any, index: number) => (
                      <div key={model.model} className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-sm">{model.model}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">${model.cost.toFixed(4)}</div>
                          <div className="text-xs text-muted-foreground">{model.tokens.toLocaleString()} tokens</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Top Performing Agents</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAgents ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : agentMetrics && Array.isArray(agentMetrics) && agentMetrics.length > 0 ? (
              <div className="space-y-3">
                {agentMetrics.slice(0, 5).map((agent: any, index: number) => (
                  <div 
                    key={agent.agentId}
                    className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    data-testid={`agent-perf-${agent.agentId}`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{agent.agentName}</p>
                        <p className="text-xs text-muted-foreground">{agent.totalExecutions} executions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${agent.successRate >= 90 ? 'text-neon-green' : agent.successRate >= 70 ? 'text-primary' : 'text-destructive'}`}>
                        {agent.successRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">success rate</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No agent performance data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
