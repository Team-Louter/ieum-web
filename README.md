# 이음 프론트엔드

React와 Vite로 만든 이음 웹 애플리케이션입니다.

## 코드를 처음 읽을 때

아래 순서로 보면 화면이 만들어지고 데이터가 전달되는 흐름을 따라갈 수 있습니다.

```text
src/main.jsx
  └─ src/App.jsx                 앱 상태와 공통 화면 구성
       ├─ src/app/routes.js       주소와 페이지 연결
       ├─ src/hooks/usePageApiData.js
       │    └─ src/api/pageData/ 화면별 데이터 불러오기
       │         ├─ src/api/client.js     서버 요청
       │         └─ src/api/demoStore.js  서버 미지원 기능의 임시 저장
       └─ src/pages/              화면 단위 컴포넌트
            └─ src/components/    여러 화면에서 쓰는 작은 컴포넌트
```

### 파일을 찾는 방법

- 화면 모양을 바꾸려면 `src/pages/`에서 해당 페이지를 찾습니다.
- 페이지 안의 반복해서 쓰는 UI는 `src/components/`에 있습니다.
- 화면에 필요한 서버 데이터는 `src/api/pageData/`에서 찾습니다.
- 로그인, 복약, 친구, 모임, 게시물 버튼 동작은 `src/app/use*Actions.js`에 기능별로 모았습니다.
- 실제 API 주소와 요청 형식은 `src/api/client.js`에 있습니다.
- 서버가 아직 지원하지 않는 기능의 브라우저 임시 데이터는 `src/api/demoStore.js`에 저장합니다.
- 서버 응답을 화면에서 쓰는 형태로 바꾸는 코드는 `src/api/adapters.js`에 있습니다.

## 화면과 데이터가 연결되는 방식

페이지 컴포넌트는 `App.jsx`에서 필요한 값을 **props**로 받습니다. 예를 들어 `onAddFriend`는 친구 신청 버튼을 눌렀을 때 실행할 함수이고, `friendDirectory`는 화면에 보여줄 친구 목록입니다.

```text
버튼 클릭 → App의 기능 함수 → API 요청(또는 임시 저장) → 데이터 다시 불러오기 → 화면 갱신
```

`usePageApiData`는 현재 주소에 맞는 데이터 로더를 실행하고, 화면에서 공통으로 쓰는 `data`, `loading`, `error`, `user`를 돌려줍니다. 상세 로더는 `src/api/pageData/`의 파일에 기능별로 나뉘어 있습니다.

### 자주 나오는 React 용어

- **컴포넌트**: 화면의 한 부분을 그리는 함수입니다. 페이지는 `src/pages/`, 재사용 UI는 `src/components/`에 둡니다.
- **props**: 부모 컴포넌트가 자식에게 전달하는 값과 함수입니다. `App.jsx`가 페이지에 데이터와 버튼 동작 함수를 전달합니다.
- **state**: 화면이 기억해야 하는 값입니다. 값이 바뀌면 React가 화면을 다시 그립니다.
- **effect**: 화면이 나타나거나 필요한 값이 바뀔 때 API 요청 같은 일을 실행합니다. 이 프로젝트에서는 `usePageApiData`가 담당합니다.

## 실행과 확인

```bash
npm install
npm run dev
```

코드 검사와 배포용 빌드는 다음 명령으로 확인합니다.

```bash
npm run lint
npm run build
```
