import './Default-Layout.css';
import Sidebar from '../Sidebar';

function DefaultLayout({ children }) {
  return (
    <div id="default-layout">
      <Sidebar></Sidebar>
      <main>{children}</main>
    </div>
  );
}

export default DefaultLayout;
