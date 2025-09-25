import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import DocumentProductionSidebar from "@/components/document-production/DocumentProductionSidebar";

export default function DocumentProductionLayout() {
  useEffect(() => {
    document.title = "הפקת מסמכים - CarsLead";
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <DocumentProductionSidebar />
      <main className="flex-1 p-4">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}