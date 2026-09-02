import './Menubar.css';

function Menubar({ list1, list2, list3 }) {
  return (
    <div id="meeting-menu-container">
      <ul id="meeting-menu">
        <li>
          <button>{list1}</button>
        </li>
        <li>
          <button>{list2}</button>
        </li>
        <li>
          <button>{list3}</button>
        </li>
      </ul>
    </div>
  );
}

export default Menubar;
