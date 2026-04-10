import { useState } from "react";
import { Footer } from "@/components/admin/Footer";
import { Header } from "@/components/admin/Header";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopNavigation } from "@/components/admin/TopNavigation";
import { pageMeta, resolvePageForRole, renderPage, roleNavigation } from "@/components/admin/AppPages";
import type { PageId, UserRole } from "@/components/admin/types";

const AdminPanel = () => {
  const [userRole] = useState<UserRole>("Admin");
  const [activePage, setActivePage] = useState<PageId>("dashboard");

  const navigation = roleNavigation[userRole];
  const resolvedPage = resolvePageForRole(activePage, userRole);
  const activeMeta = pageMeta[resolvedPage];

  return (
    <div className="min-h-screen bg-[var(--shell-bg)] text-[var(--text-main)]">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <Sidebar
          activeItem={resolvedPage}
          onSelect={(id) => setActivePage(resolvePageForRole(id as PageId, userRole))}
          role={userRole}
          sections={navigation.sidebarSections}
        />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header description={activeMeta.description} title={activeMeta.title} />
          <TopNavigation
            activeItem={resolvedPage}
            items={navigation.quickAccessPages}
            onSelect={(id) => setActivePage(resolvePageForRole(id as PageId, userRole))}
          />
          <main className="flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
            {renderPage(resolvedPage, (page) => setActivePage(resolvePageForRole(page, userRole)), userRole)}
          </main>
          <Footer pageLabel={activeMeta.title} />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
