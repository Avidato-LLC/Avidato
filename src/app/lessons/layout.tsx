import DashboardThemeProvider from "@/components/DashboardThemeProvider";

export default function LessonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        {children}
      </div>
    </DashboardThemeProvider>
  );
}