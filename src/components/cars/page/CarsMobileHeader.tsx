
import { useState } from "react";
import { Plus, MessageSquare, Filter } from "lucide-react";
import { AddCarForm } from "@/components/cars/AddCarForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CarsMobileHeaderProps {
  onAddCar: () => void;
  onWhatsApp: () => void;
  onFilter: () => void;
  carsCount: number;
}

export function CarsMobileHeader({ 
  onAddCar, 
  onWhatsApp, 
  onFilter, 
  carsCount 
}: CarsMobileHeaderProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddCar = () => {
    setShowAddDialog(true);
    onAddCar();
  };

  const handleWhatsApp = () => {
    window.open('https://web.whatsapp.com', '_blank');
    onWhatsApp();
  };

  const handleFilter = () => {
    alert('פונקציונליות סינון תתווסף בקרוב');
    onFilter();
  };

  return (
    <>
      <div className="px-4 pt-4 space-y-4">
        {/* Enhanced header with brand gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-white mb-1 text-right">
                מלאי רכבים
              </h1>
              <p className="text-sm text-white/90 text-right">
                {carsCount} רכבים במלאי
              </p>
            </div>
            <button
              onClick={handleAddCar}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all duration-200 active:scale-95 flex items-center justify-center"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleWhatsApp}
            className="flex-1 h-10 px-4 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors bg-green-50 border-2 border-green-200 text-green-700 hover:bg-green-100"
          >
            <MessageSquare className="h-5 w-5" />
            וואטסאפ
          </button>
          <button
            onClick={handleFilter}
            className="flex-1 h-10 px-4 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors bg-blue-50 border-2 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Filter className="h-5 w-5" />
            סינון
          </button>
        </div>
      </div>

      {/* Add Car Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוסף רכב חדש</DialogTitle>
          </DialogHeader>
          <AddCarForm onSuccess={() => setShowAddDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
