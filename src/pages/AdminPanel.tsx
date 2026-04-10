import { useState } from "react";
import { Footer } from "@/components/admin/Footer";
import { Header } from "@/components/admin/Header";
import { Sidebar } from "@/components/admin/Sidebar";
import { getPageHeaderOverview, pageMeta, resolvePageForRole, renderPage, roleNavigation } from "@/components/admin/AppPages";
import type { PageId, UserRole } from "@/components/admin/types";

const AdminPanel = () => {
  const [userRole] = useState<UserRole>("Admin");
  const [activePage, setActivePage] = useState<PageId>("dashboard");

  const navigation = roleNavigation[userRole];
  const resolvedPage = resolvePageForRole(activePage, userRole);
  const activeMeta = pageMeta[resolvedPage];
  const headerOverview = getPageHeaderOverview(resolvedPage, userRole);

  return (
    <div className="bg-festive-admin min-h-screen text-[var(--text-main)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col lg:flex-row">
        <Sidebar
          activeItem={resolvedPage}
          onSelect={(id) => setActivePage(resolvePageForRole(id as PageId, userRole))}
          role={userRole}
          sections={navigation.sidebarSections}
        />
        <div className="relative flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(217,106,20,0.14),transparent)]" />
          <Header description={activeMeta.description} overview={headerOverview} title={activeMeta.title} />
          <main className="relative flex-1 px-3 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
            {renderPage(resolvedPage, (page) => setActivePage(resolvePageForRole(page, userRole)), userRole)}
          </main>
          <Footer pageLabel={activeMeta.title} />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
