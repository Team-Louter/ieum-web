import profileImg from '../../../assets/images/profile.png';
import '../../common/Skeleton/Skeleton.css';

/** 지도 커스텀 오버레이에 사용할 친구 위치 핑 DOM 요소를 생성합니다. 사진이 준비될 때까지 회색 원을 보여줍니다. */
function createNearbyFriendPingElement(nickname, profileImage, isProfileLoading = false) {
  const pingElement = document.createElement('div');
  pingElement.className = 'nearby-friend-ping';
  pingElement.setAttribute('aria-label', `${nickname}의 위치`);

  const circleElement = document.createElement('div');
  circleElement.className = 'nearby-friend-ping__circle';

  const skeletonElement = document.createElement('span');
  skeletonElement.className = 'skeleton skeleton--circle nearby-friend-ping__skeleton';
  skeletonElement.setAttribute('aria-hidden', 'true');

  const profileImageElement = document.createElement('img');
  profileImageElement.alt = `${nickname} 프로필 사진`;
  profileImageElement.style.display = 'none';

  /** 사진이 준비되면 회색 원을 치우고 사진을 보여줍니다. */
  function showImage() {
    skeletonElement.remove();
    profileImageElement.style.display = '';
  }

  profileImageElement.addEventListener('load', showImage);
  profileImageElement.addEventListener('error', () => {
    if (profileImageElement.getAttribute('src') !== profileImg) {
      profileImageElement.src = profileImg;
      return;
    }
    showImage();
  });

  // 프로필을 아직 불러오는 중이면 사진 주소를 정하지 않고 회색 원만 유지합니다.
  if (!isProfileLoading) {
    profileImageElement.src = profileImage || profileImg;
  }

  const triangleElement = document.createElement('div');
  triangleElement.className = 'nearby-friend-ping__triangle';

  const tooltipElement = document.createElement('div');
  tooltipElement.className = 'nearby-friend-ping__tooltip';

  const nicknameElement = document.createElement('p');
  nicknameElement.textContent = nickname;

  tooltipElement.appendChild(nicknameElement);
  circleElement.append(skeletonElement, profileImageElement);
  pingElement.append(circleElement, triangleElement, tooltipElement);

  return pingElement;
}

export default createNearbyFriendPingElement;
