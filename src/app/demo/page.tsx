"use client";
import ToastDemo from "@/components/demo/toast-demo";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { useState } from "react";

export default function DemoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-8 relative">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Aether UI Components Demo
              </h1>
              <p className="text-gray-600 mb-8">
                Test and explore the modern UI components used throughout the
                Aether platform.
              </p>
            </div>

            <div className="grid gap-8">
              {/* Toast Demo Section */}
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Toast Notifications
                  </h2>
                  <p className="text-gray-600">
                    Modern toast notifications with progress timers and multiple
                    variants.
                  </p>
                </div>

                <div className="flex justify-center">
                  <ToastDemo />
                </div>
              </section>

              {/* Future Demo Sections */}
              <section className="opacity-50">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    More Components Coming Soon
                  </h2>
                  <p className="text-gray-600">
                    Dashboard widgets, forms, modals, and more component demos
                    will be added here.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
