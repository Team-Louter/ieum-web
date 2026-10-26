# 커뮤니티 서버 연동 변경

기존 이웃마당 글은 계정별 브라우저 localStorage의 데모 데이터였습니다. 새 글은 `/api/community/posts` 서버에 저장되며, 전체 피드와 내 글, 작성자별 글을 분리해 조회합니다. 기존 로컬 글은 자동 업로드하지 않습니다.

- 서버 브랜치: Team-Louter/ieum-server의 `fix/deployment-api-and-image-uploads`
- 새 서버를 먼저 배포하고 이 프론트 브랜치를 배포해야 합니다. API 미배포 오류를 로컬 저장 성공으로 처리하지 않습니다.
- 새 테이블은 서버의 ddl-auto=update로 추가됩니다. 기존 DB 및 이미지 볼륨을 삭제하지 마세요.
- 이미지 첨부는 선택이며 JPEG/PNG 5MB 이하입니다. 동영상 업로드는 지원하지 않습니다.
- GET `/api/community/posts?page=0&size=20`: `{posts,hasNext,totalCount}`. 내 글은 `mine=true`, 작성자별은 `authorId=숫자ID`.
- POST 기본 경로: `{title,content}` JSON, 또는 multipart의 JSON `request`와 이미지 `file`.
- DELETE `/{id}`: 작성자만 삭제. PUT/DELETE `/{id}/like`: 좋아요 저장/취소. POST `/{id}/comments`: `{content}`.
- 글의 authorId로 `/profile/{authorId}`를 열고 GET `/api/profile/{userId}` 및 작성자별 글을 조회합니다.
- 내 모임 화면과 내 프로필의 모임 탭은 GET `/api/community/meetings/my`를 사용해 개설+JOINED 모임을 표시합니다.
- 모임 상세는 서버 membershipStatus/canJoin/canLeave/canManage를 우선하며 로컬 모임 정보는 이미지 보완에만 사용합니다.

검증: `node --test tests/community-api.test.mjs`, `npm run build`, `npm run lint`.
