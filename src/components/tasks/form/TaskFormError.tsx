
interface TaskFormErrorProps {
  title: string;
  description: string;
}

export function TaskFormError({ title, description }: TaskFormErrorProps) {
  return (
    <div className="p-4 text-center" dir="rtl">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-800 mb-2">{title}</h2>
        <p className="text-red-600 mb-4">{description}</p>
        <button 
          onClick={() => window.history.back()} 
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          חזור
        </button>
      </div>
    </div>
  );
}
