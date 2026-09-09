import './Layout.css';
import Sidebar from '../Sidebar/Sidebar';

function Layout({ children }) {
  return (
    <div id="default-layout">
      <Sidebar></Sidebar>
      <main>{children}</main>
    </div>
  );
}

export default Layout;
