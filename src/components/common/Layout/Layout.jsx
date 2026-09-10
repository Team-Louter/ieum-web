import './Layout.css';
import Sidebar from '../Sidebar/Sidebar';

function Layout({ children, className = '' }) {
  return (
    <div id="default-layout" className={className}>
      <Sidebar></Sidebar>
      <main>{children}</main>
    </div>
  );
}

export default Layout;
