import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({ children }) {
  return (
    <div className="app-layout-shell">
      <Sidebar />
      <div className="app-main-viewport">
        <Header />
        <main className="app-content-canvas">
          {children}
        </main>
      </div>
    </div>
  );
}
