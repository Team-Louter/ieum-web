import profileImg from '../../../assets/images/profile.png';
import '../../common/Skeleton/Skeleton.css';

const GROUP_NICKNAME_LIMIT = 6;

/**
 * 지도 커스텀 오버레이에 사용할 친구 위치 핑 DOM 요소를 생성합니다. 사진이 준비될 때까지 회색 원을 보여줍니다.
 * groupNicknames에 2명 이상의 닉네임을 넘기면 같은 자리의 친구를 하나로 묶어 "+N"과 닉네임 목록을 보여줍니다.
 */
function createNearbyFriendPingElement(
  nickname,
  profileImage,
  isProfileLoading = false,
  groupNicknames = [],
) {
  const isGroup = groupNicknames.length > 1;
  const pingElement = document.createElement('div');
  pingElement.className = isGroup ? 'nearby-friend-ping nearby-friend-ping--group' : 'nearby-friend-ping';
  pingElement.setAttribute(
    'aria-label',
    isGroup ? `${groupNicknames.length}명이 이 근처에 있어요` : `${nickname}의 위치`,
  );

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
    // 이미 받아 둔 사진이면 회색 원을 거치지 않고 바로 보여 줍니다.
    if (profileImageElement.complete && profileImageElement.naturalWidth > 0) showImage();
  }

  const triangleElement = document.createElement('div');
  triangleElement.className = 'nearby-friend-ping__triangle';

  const tooltipElement = document.createElement('div');
  tooltipElement.className = 'nearby-friend-ping__tooltip';

  if (isGroup) {
    tooltipElement.classList.add('nearby-friend-ping__tooltip--list');
    groupNicknames.slice(0, GROUP_NICKNAME_LIMIT).forEach((name) => {
      const nameElement = document.createElement('p');
      nameElement.textContent = name;
      tooltipElement.appendChild(nameElement);
    });
    if (groupNicknames.length > GROUP_NICKNAME_LIMIT) {
      const moreElement = document.createElement('p');
      moreElement.className = 'nearby-friend-ping__more';
      moreElement.textContent = `외 ${groupNicknames.length - GROUP_NICKNAME_LIMIT}명`;
      tooltipElement.appendChild(moreElement);
    }
  } else {
    const nicknameElement = document.createElement('p');
    nicknameElement.textContent = nickname;
    tooltipElement.appendChild(nicknameElement);
  }

  circleElement.append(skeletonElement, profileImageElement);
  pingElement.append(circleElement, triangleElement, tooltipElement);

  if (isGroup) {
    const countElement = document.createElement('span');
    countElement.className = 'nearby-friend-ping__count';
    countElement.textContent = `+${groupNicknames.length - 1}`;
    pingElement.appendChild(countElement);
  }

  return pingElement;
}

export default createNearbyFriendPingElement;
