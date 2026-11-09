import profileImg from '../../../assets/images/profile.png';

/** 지도 커스텀 오버레이에 사용할 친구 위치 핑 DOM 요소를 생성합니다. */
function createNearbyFriendPingElement(nickname, profileImage) {
  const pingElement = document.createElement('div');
  pingElement.className = 'nearby-friend-ping';
  pingElement.setAttribute('aria-label', `${nickname}의 위치`);

  const circleElement = document.createElement('div');
  circleElement.className = 'nearby-friend-ping__circle';

  const profileImageElement = document.createElement('img');
  profileImageElement.src = profileImage || profileImg;
  profileImageElement.alt = `${nickname} 프로필 사진`;

  const triangleElement = document.createElement('div');
  triangleElement.className = 'nearby-friend-ping__triangle';

  const tooltipElement = document.createElement('div');
  tooltipElement.className = 'nearby-friend-ping__tooltip';

  const nicknameElement = document.createElement('p');
  nicknameElement.textContent = nickname;

  tooltipElement.appendChild(nicknameElement);
  circleElement.appendChild(profileImageElement);
  pingElement.append(circleElement, triangleElement, tooltipElement);

  return pingElement;
}

export default createNearbyFriendPingElement;
