import './Layout.css';

function Layout({ children, className = '' }) {
  return (
    <div id="default-layout" className={className}>
      <main>{children}</main>
    </div>
  );
}

export default Layout;
