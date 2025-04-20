
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Send, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface CarsGridProps {
  cars: any[];
  isLoading: boolean;
}

export function CarsGrid({ cars, isLoading }: CarsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="relative h-48 bg-muted">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader className="p-4 pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-2 mt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
            </CardContent>
            <CardFooter className="p-4 flex justify-between">
              <Skeleton className="h-8 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!cars.length) {
    return (
      <div className="text-center py-12 px-4">
        <div className="mx-auto rounded-full w-12 h-12 flex items-center justify-center bg-muted mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-6 w-6 text-muted-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-1">אין רכבים במלאי</h3>
        <p className="text-muted-foreground mb-4">
          התחל להוסיף רכבים למלאי שלך כדי לראות אותם כאן
        </p>
        <Button>הוסף רכב חדש</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => (
        <Card key={car.id} className="overflow-hidden">
          <div className="relative h-48 bg-muted">
            {/* Car image would go here */}
            <div className="absolute top-2 right-2">
              <Badge className={getStatusBadgeColor(car.status)}>
                {getStatusText(car.status)}
              </Badge>
            </div>
          </div>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">
              {car.make} {car.model} {car.year}
            </CardTitle>
            <p className="text-lg font-bold">{car.price.toLocaleString()} ₪</p>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-1 text-sm mt-2">
              <span className="text-muted-foreground">ק"מ:</span>
              <span>{car.kilometers.toLocaleString()}</span>
              {car.fuel_type && (
                <>
                  <span className="text-muted-foreground">דלק:</span>
                  <span>{car.fuel_type}</span>
                </>
              )}
              {car.transmission && (
                <>
                  <span className="text-muted-foreground">תיבת הילוכים:</span>
                  <span>{car.transmission}</span>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-4 flex justify-between">
            <Button size="sm" variant="outline">
              צפה בפרטים
            </Button>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost">
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                <Send className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function getStatusBadgeColor(status: string | null) {
  switch (status) {
    case "available":
      return "bg-green-500 hover:bg-green-600";
    case "reserved":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "sold":
      return "bg-gray-500 hover:bg-gray-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
}

function getStatusText(status: string | null) {
  switch (status) {
    case "available":
      return "זמין";
    case "reserved":
      return "שמור";
    case "sold":
      return "נמכר";
    default:
      return "לא ידוע";
  }
}
