import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, trend, icon: Icon, color }) => {
  return (
    <Card className={`bg-gradient-to-br ${color} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
          <Icon className="h-5 w-5 text-white/80" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">{value}</span>
          <Badge 
            variant={trend === 'up' ? 'default' : 'destructive'}
            className="bg-white/20 text-white border-white/30"
          >
            {change}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;