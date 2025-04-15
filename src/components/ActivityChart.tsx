
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// נתוני דוגמה עבור הגרף
const data = [
  {
    name: '9/4',
    לידים: 4,
    מכירות: 1,
  },
  {
    name: '10/4',
    לידים: 3,
    מכירות: 0,
  },
  {
    name: '11/4',
    לידים: 5,
    מכירות: 2,
  },
  {
    name: '12/4',
    לידים: 7,
    מכירות: 1,
  },
  {
    name: '13/4',
    לידים: 2,
    מכירות: 1,
  },
  {
    name: '14/4',
    לידים: 6,
    מכירות: 2,
  },
  {
    name: 'היום',
    לידים: 8,
    מכירות: 3,
  },
];

export function ActivityChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            tickMargin={10}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              textAlign: 'right',
              direction: 'rtl'
            }}
            formatter={(value, name) => [`${value}`, name]}
            labelFormatter={(label) => `תאריך: ${label}`}
          />
          <Legend 
            formatter={(value) => <span style={{ textAlign: 'right', direction: 'rtl' }}>{value}</span>}
          />
          <Bar dataKey="לידים" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="מכירות" fill="#16a34a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
