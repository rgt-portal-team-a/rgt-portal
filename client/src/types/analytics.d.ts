


export interface TurnoverByTenureInterface{
    tenure: string;
    count: number;
    percentage: string;
}

export interface TurnoverByPositionInterface {
  position: string;
  turnoverRate: string;
  employeeCount: number;
}


export interface LeavingReasonsInterface {
  reason: string;
  percentage: string;
  count: number;
}

export interface TurnoverTrendsInterface {
  monthlyData:{ 
                month: string;
                count: string
              }[];
  movingAverage: number[];
}
