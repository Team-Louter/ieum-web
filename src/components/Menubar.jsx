import './Menubar.css';
import { useNavigate } from 'react-router-dom';

function Menubar({ list1, list2, list3, path1, path2, path3 }) {
  const navigate = useNavigate();
  const menuItems = [
    { label: list1, path: path1 },
    { label: list2, path: path2 },
    { label: list3, path: path3 },
  ];

  return (
    <div id="meeting-menu-container">
      <ul id="meeting-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <button type="button" onClick={() => navigate(item.path)}>{item.label}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Menubar;
