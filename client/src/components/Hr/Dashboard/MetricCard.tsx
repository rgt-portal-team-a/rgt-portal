import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface IMetricCard {
  title: string;
  value: string;
  growth: string;
  color: keyof typeof colors;
  isLoading?: boolean;
}
export type ColorType = keyof typeof colors;

  // Color mapping for different card types
const colors = {
    purple: {
      footerBg: 'bg-purple-600',
      iconBg: 'bg-purple-600',
      iconColor: 'text-purple-100',
      chartColor: '#9333ea'
    },
    pink: {
      footerBg: 'bg-pink-500',
      iconBg: 'bg-pink-500',
      iconColor: 'text-pink-100',
      chartColor: '#ec4899'
    },
    blue: {
      footerBg: 'bg-sky-400',
      iconBg: 'bg-sky-400',
      iconColor: 'text-sky-100',
      chartColor: '#38bdf8'
    },
    yellow: {
      footerBg: 'bg-amber-400',
      iconBg: 'bg-amber-400',
      iconColor: 'text-amber-100',
      chartColor: '#fbbf24'
    }
  };

export const MetricCard = ({
  title,
  value,
  growth,
  color,
  isLoading = false,
}: IMetricCard) => {
  const selectedColor = colors[color];

  // Simple chart representing a line graph
  const ChartLine = () => <img src="/ChartLines.svg" alt="Chart" />;

  if (isLoading) {
    return (
      <Card className="overflow-hidden pb-0">
        <CardContent className="pt-6">
          <div className="flex items-center mb-2">
            <Skeleton className="h-10 w-10 rounded-lg mr-2" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex justify-between items-center mt-5">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
          </div>
        </CardContent>
        <CardFooter className="bg-gray-200 text-white p-4 mt-2">
          <Skeleton className="h-6 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden pb-0">
      <CardContent className="pt-6">
        <div className="flex items-center mb-2">
          <div className={`p-2 rounded-lg ${selectedColor.iconBg} mr-2`}>
            <svg
              width="19"
              height="19"
              viewBox="0 0 19 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.88385 9.07886C8.49216 9.07886 9.80804 7.76297 9.80804 6.15466C9.80804 4.54636 8.49216 3.23047 6.88385 3.23047C5.27554 3.23047 3.95965 4.54636 3.95965 6.15466C3.95965 7.76297 5.27554 9.07886 6.88385 9.07886ZM10.1736 8.42092C11.4164 9.44439 13.244 9.22507 14.2674 7.98229C15.2909 6.7395 15.0716 4.91188 13.8288 3.88841C13.3171 3.44978 12.6591 3.23047 12.0012 3.23047C11.3432 3.23047 10.6853 3.44978 10.1736 3.88841C11.4164 4.91188 11.6357 6.6664 10.6122 7.98229C10.5391 8.1285 10.3198 8.27471 10.1736 8.42092ZM17.411 14.8541C16.9723 12.1493 14.7061 10.1754 12.0012 10.1754C11.3432 10.1754 10.7584 10.2485 10.1736 10.4679C12.0743 11.1258 13.4633 12.8072 13.7557 14.781C13.8288 15.1466 13.5364 15.5852 13.0978 15.5852H13.0247H16.6799C17.1185 15.5852 17.411 15.2928 17.411 14.8541C17.411 14.9273 17.411 14.8541 17.411 14.8541ZM6.88385 10.1754C4.17897 10.1754 1.83961 12.1493 1.47409 14.8541C1.40098 15.2197 1.6934 15.6583 2.13203 15.6583H2.20513H11.5626C12.0012 15.6583 12.2936 15.3659 12.2936 14.9273V14.8541C11.9281 12.1493 9.58873 10.1754 6.88385 10.1754Z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-gray-700 font-medium">{title}</span>
        </div>

        <div className="flex justify-between items-center mt-5">
          <h2 className="text-4xl font-bold text-gray-800">{value}</h2>
          <ChartLine />
        </div>
      </CardContent>

      <CardFooter className={`${selectedColor.footerBg} text-white p-4 mt-2`}>
        <div className="flex items-center w-full">
          <div className={`p-1 rounded-full bg-opacity-20 mr-2`}>
            <img src="/Vector.svg" alt="Growth" />
          </div>
          <span className="font-medium">+{growth}% than last Month</span>
        </div>
      </CardFooter>
    </Card>
  );
};