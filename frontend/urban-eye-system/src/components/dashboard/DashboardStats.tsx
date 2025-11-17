import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface StatsProps {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  myIssues: number;
}

const DashboardStats = ({ totalIssues, pendingIssues, resolvedIssues, myIssues }: StatsProps) => {
  const stats = [
    {
      title: 'Total Issues',
      value: totalIssues,
      icon: AlertTriangle,
      color: 'text-primary',
    },
    {
      title: 'Pending',
      value: pendingIssues,
      icon: Clock,
      color: 'text-accent',
    },
    {
      title: 'Resolved',
      value: resolvedIssues,
      icon: CheckCircle,
      color: 'text-secondary',
    },
    {
      title: 'My Reports',
      value: myIssues,
      icon: TrendingUp,
      color: 'text-destructive',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;